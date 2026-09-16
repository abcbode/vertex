import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  getSql,
  authMiddleware,
  n,
  requireActiveUser,
  ensureProfile,
  applyLedger,
  setting,
  logActivity,
} from "./core";
import { settleExpired, syncOne } from "./market";
import { iso } from "@/lib/format";

function inHours(start: string | null, end: string | null) {
  if (!start || !end) return true;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const a = sh * 60 + sm;
  const b = eh * 60 + em;
  if (a <= b) return cur >= a && cur <= b;
  return cur >= a || cur <= b;
}

export const placeTrade = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      assetId: z.number(),
      direction: z.enum(["up", "down"]),
      amount: z.number().positive(),
      expirySeconds: z.number().int().positive(),
      entryPrice: z.number().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const { profile, wallet } = await requireActiveUser(sql, context.userId);
    if ((await setting(sql, "maintenance", "false")) === "true") {
      throw new Error("Hệ thống đang bảo trì");
    }
    const min = n(await setting(sql, "min_trade", "50000"));
    const max = n(await setting(sql, "max_trade", "100000000"));
    if (data.amount < min) throw new Error(`Số tiền tối thiểu ${min.toLocaleString("vi-VN")} đ`);
    if (data.amount > max) throw new Error("Vượt hạn mức giao dịch");
    if (wallet.balance < data.amount) throw new Error("Số dư không đủ");

    await syncOne(sql, data.assetId, 15);
    const asset = await sql<{
      id: number;
      current_price: string;
      base_price: string;
      payout: string;
      is_active: boolean;
      trading_paused: boolean;
      trade_start: string | null;
      trade_end: string | null;
      symbol: string;
      decimals: number;
    }>`select id, current_price, base_price, payout, is_active, trading_paused, trade_start, trade_end, symbol, decimals from assets where id = ${data.assetId}`;
    const a = asset[0];
    if (!a || !a.is_active) throw new Error("Tài sản không khả dụng");
    if (a.trading_paused) throw new Error("Tài sản đang tạm dừng giao dịch");
    if (!inHours(a.trade_start, a.trade_end)) throw new Error("Ngoài khung giờ giao dịch");

    const exp = await sql<{ seconds: number }>`select seconds from expiries where seconds = ${data.expirySeconds} and is_active = true`;
    if (!exp[0]) throw new Error("Thời gian lệnh không hợp lệ");

    const payout = n(a.payout);
    const live = n(a.current_price) || n(a.base_price);
    const shown = data.entryPrice && data.entryPrice > 0 ? data.entryPrice : live;
    if (!(live > 0) && !(shown > 0)) throw new Error("Giá thị trường chưa sẵn sàng, thử lại");
    const drift = live > 0 ? Math.abs(shown - live) / live : 0;
    const price = shown > 0 && (live <= 0 || drift < 0.02) ? shown : live;
    const expiresAt = new Date(Date.now() + data.expirySeconds * 1000).toISOString();
    const inserted = await sql<{ id: number }>`
      insert into trades (user_id, asset_id, direction, amount, payout, expiry_seconds, entry_price, expires_at)
      values (${context.userId}, ${data.assetId}, ${data.direction}, ${data.amount}, ${payout}, ${data.expirySeconds}, ${price}, ${expiresAt})
      returning id`;
    const id = inserted[0].id;
    await applyLedger(sql, context.userId, "trade_hold", -data.amount, `Dat lenh ${a.symbol} ${data.direction}`, "trade", id);
    await sql`update wallets set total_volume = total_volume + ${data.amount} where user_id = ${context.userId}`;
    await logActivity(sql, context.userId, profile.role, "place_trade", `${a.symbol} ${data.direction} ${data.amount}`);
    const row = await sql<{
      id: number;
      direction: string;
      amount: string;
      payout: string;
      expiry_seconds: number;
      entry_price: string;
      status: string;
      expires_at: unknown;
      opened_at: unknown;
    }>`select id, direction, amount, payout, expiry_seconds, entry_price, status, expires_at, opened_at from trades where id = ${id}`;
    const t = row[0];
    return {
      id: t.id,
      symbol: a.symbol,
      decimals: a.decimals,
      direction: t.direction,
      amount: n(t.amount),
      payout: n(t.payout),
      expirySeconds: t.expiry_seconds,
      entryPrice: n(t.entry_price),
      status: t.status,
      expiresAt: iso(t.expires_at),
      openedAt: iso(t.opened_at),
    };
  });

export const listMyTrades = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: { page?: number; status?: string; from?: string; to?: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const page = Math.max(1, data.page ?? 1);
    const limit = 20;
    const offset = (page - 1) * limit;
    const status = data.status && data.status !== "all" ? data.status : null;
    const from = data.from || null;
    const to = data.to || null;
    const rows = await sql<{
      id: number;
      asset_id: number;
      symbol: string;
      direction: string;
      amount: string;
      payout: string;
      entry_price: string;
      exit_price: string | null;
      status: string;
      profit: string | null;
      opened_at: unknown;
      expires_at: unknown;
      settled_at: unknown;
    }>`select t.id, t.asset_id, a.symbol, t.direction, t.amount, t.payout, t.entry_price, t.exit_price, t.status, t.profit, t.opened_at, t.expires_at, t.settled_at
       from trades t join assets a on a.id = t.asset_id
       where t.user_id = ${context.userId}
         and (${status}::text is null or t.status = ${status})
         and (${from}::date is null or t.opened_at::date >= ${from}::date)
         and (${to}::date is null or t.opened_at::date <= ${to}::date)
       order by t.opened_at desc
       limit ${limit} offset ${offset}`;
    const total = await sql<{ c: number }>`
      select count(*)::int as c from trades t
      where t.user_id = ${context.userId}
        and (${status}::text is null or t.status = ${status})
        and (${from}::date is null or t.opened_at::date >= ${from}::date)
        and (${to}::date is null or t.opened_at::date <= ${to}::date)`;
    const stats = await sql<{ win: string; loss: string; winc: number; lossc: number }>`
      select coalesce(sum(case when status='win' then profit else 0 end),0) as win,
             coalesce(sum(case when status='loss' then amount else 0 end),0) as loss,
             count(*) filter (where status='win')::int as winc,
             count(*) filter (where status='loss')::int as lossc
      from trades where user_id = ${context.userId}`;
    return {
      page,
      total: total[0]?.c ?? 0,
      win: n(stats[0]?.win),
      loss: n(stats[0]?.loss),
      winCount: stats[0]?.winc ?? 0,
      lossCount: stats[0]?.lossc ?? 0,
      rows: rows.map((r) => ({
        id: r.id,
        assetId: r.asset_id,
        symbol: r.symbol,
        direction: r.direction,
        amount: n(r.amount),
        payout: n(r.payout),
        entryPrice: n(r.entry_price),
        exitPrice: r.exit_price == null ? null : n(r.exit_price),
        status: r.status,
        profit: r.profit == null ? null : n(r.profit),
        openedAt: iso(r.opened_at),
        expiresAt: iso(r.expires_at),
        settledAt: r.settled_at ? iso(r.settled_at) : null,
      })),
    };
  });

export const listRunningTrades = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await settleExpired(sql);
    const rows = await sql<{
      id: number;
      symbol: string;
      decimals: number;
      direction: string;
      amount: string;
      payout: string;
      entry_price: string;
      status: string;
      profit: string | null;
      expires_at: unknown;
      opened_at: unknown;
    }>`select t.id, a.symbol, a.decimals, t.direction, t.amount, t.payout, t.entry_price, t.status, t.profit, t.expires_at, t.opened_at
       from trades t join assets a on a.id = t.asset_id
       where t.user_id = ${context.userId} and (t.status = 'running' or t.settled_at > now() - interval '20 seconds')
       order by t.opened_at desc limit 20`;
    const w = await sql<{ balance: string }>`select balance from wallets where user_id = ${context.userId}`;
    return {
      balance: n(w[0]?.balance),
      rows: rows.map((r) => ({
        id: r.id,
        symbol: r.symbol,
        decimals: r.decimals,
        direction: r.direction,
        amount: n(r.amount),
        payout: n(r.payout),
        entryPrice: n(r.entry_price),
        status: r.status,
        profit: r.profit == null ? null : n(r.profit),
        expiresAt: iso(r.expires_at),
        openedAt: iso(r.opened_at),
      })),
    };
  });