import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { hashPassword } from "better-auth/crypto";
import { randomBytes } from "node:crypto";
import {
  getSql,
  authMiddleware,
  n,
  requireAdmin,
  ensureProfile,
  applyLedger,
  setting,
  logActivity,
  type Sql,
} from "./core";
import { generateTotpSecret, verifyTotp, totpUri } from "@/lib/totp";
import { iso } from "@/lib/format";

const SEED_ADMIN_ID = "vertex-seed-admin";
const SEED_ADMIN_EMAIL = "admin@vertex.app";
const SEED_ADMIN_PASSWORD = "phuoc123";

async function ensureSeedAdmin(sql: Sql) {
  const hash = await hashPassword(SEED_ADMIN_PASSWORD);
  const byId = await sql<{ id: string }>`select id from "user" where id = ${SEED_ADMIN_ID}`;
  const byEmail = await sql<{ id: string }>`select id from "user" where email = ${SEED_ADMIN_EMAIL}`;
  let userId = byId[0]?.id ?? byEmail[0]?.id;
  if (!userId) {
    userId = SEED_ADMIN_ID;
    await sql`
      insert into "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
      values (${userId}, 'Admin', ${SEED_ADMIN_EMAIL}, true, now(), now())`;
  } else {
    await sql`update "user" set email = ${SEED_ADMIN_EMAIL}, name = 'Admin', "updatedAt" = now() where id = ${userId}`;
  }
  const acct = await sql<{ id: string }>`
    select id from account where "userId" = ${userId} and "providerId" = 'credential'`;
  if (acct[0]) {
    await sql`update account set password = ${hash}, "updatedAt" = now() where id = ${acct[0].id}`;
  } else {
    await sql`
      insert into account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
      values (${`${userId}-credential`}, ${userId}, 'credential', ${userId}, ${hash}, now(), now())`;
  }
  await sql`
    insert into profiles (user_id, display_name, role, status)
    values (${userId}, 'Admin', 'superadmin', 'active')
    on conflict (user_id) do update
      set role = 'superadmin', status = 'active', display_name = excluded.display_name, updated_at = now()`;
  await sql`
    insert into wallets (user_id, balance) values (${userId}, 0)
    on conflict (user_id) do nothing`;
  return { email: SEED_ADMIN_EMAIL };
}

export const prepareAdminLogin = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return ensureSeedAdmin(sql);
});

export const adminPing = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const { profile } = await ensureProfile(sql, context.userId);
    const isAdmin = profile.role === "admin" || profile.role === "superadmin";
    let twoFa = false;
    if (isAdmin && profile.totpEnabled) {
      const ok = await sql<{ verified_at: unknown }>`select verified_at from admin_2fa_ok where user_id = ${context.userId}`;
      twoFa = Boolean(ok[0]) && Date.now() - new Date(iso(ok[0].verified_at)).getTime() < 12 * 3600_000;
    }
    return {
      isAdmin,
      totpEnabled: profile.totpEnabled,
      twoFaOk: !profile.totpEnabled || twoFa,
      role: profile.role,
      status: profile.status,
    };
  });

export const verifyAdmin2fa = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ code: z.string() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const { profile } = await ensureProfile(sql, context.userId);
    if (profile.role !== "admin" && profile.role !== "superadmin") throw new Error("Không có quyền");
    const row = await sql<{ totp_secret: string | null; totp_enabled: boolean }>`
      select totp_secret, totp_enabled from profiles where user_id = ${context.userId}`;
    if (!row[0]?.totp_enabled || !row[0].totp_secret) throw new Error("Chưa bật 2FA");
    if (!verifyTotp(row[0].totp_secret, data.code)) throw new Error("Mã 2FA không đúng");
    await sql`insert into admin_2fa_ok (user_id, verified_at) values (${context.userId}, now())
      on conflict (user_id) do update set verified_at = now()`;
    return { ok: true };
  });

export const setupAdmin2fa = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId).catch(async (e) => {
      if (String(e.message) !== "2FA_REQUIRED") throw e;
    });
    const { profile } = await ensureProfile(sql, context.userId);
    if (profile.role !== "admin" && profile.role !== "superadmin") throw new Error("Không có quyền");
    const secret = generateTotpSecret();
    await sql`update profiles set totp_secret = ${secret}, totp_enabled = false where user_id = ${context.userId}`;
    return { secret, uri: totpUri(secret, profile.email || "admin") };
  });

export const confirmAdmin2fa = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ code: z.string() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const row = await sql<{ totp_secret: string | null }>`select totp_secret from profiles where user_id = ${context.userId}`;
    if (!row[0]?.totp_secret || !verifyTotp(row[0].totp_secret, data.code)) throw new Error("Mã không đúng");
    await sql`update profiles set totp_enabled = true where user_id = ${context.userId}`;
    await sql`insert into admin_2fa_ok (user_id, verified_at) values (${context.userId}, now())
      on conflict (user_id) do update set verified_at = now()`;
    return { ok: true };
  });

export const disableAdmin2fa = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ code: z.string() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const row = await sql<{ totp_secret: string | null }>`select totp_secret from profiles where user_id = ${context.userId}`;
    if (!row[0]?.totp_secret || !verifyTotp(row[0].totp_secret, data.code)) throw new Error("Mã không đúng");
    await sql`update profiles set totp_enabled = false, totp_secret = null where user_id = ${context.userId}`;
    await sql`delete from admin_2fa_ok where user_id = ${context.userId}`;
    return { ok: true };
  });

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: { range?: "day" | "month" | "all" }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const range = data.range ?? "all";
    const since =
      range === "day"
        ? "now() - interval '1 day'"
        : range === "month"
          ? "now() - interval '30 day'"
          : null;
    const users = await sql<{ total: number; neu: number; locked: number; active: number }>`
      select count(*)::int as total,
             count(*) filter (where created_at > now() - interval '1 day')::int as neu,
             count(*) filter (where status = 'locked')::int as locked,
             count(*) filter (where status = 'active')::int as active
      from profiles`;
    const money = await sql<{ dep: string; wd: string }>`
      select coalesce(sum(total_deposit),0) as dep, coalesce(sum(total_withdraw),0) as wd from wallets`;
    const trades = await sql<{ vol: string; win: string; loss: string; upn: number; downn: number; winc: number; lossc: number }>`
      select coalesce(sum(amount),0) as vol,
             coalesce(sum(case when status='win' then profit else 0 end),0) as win,
             coalesce(sum(case when status='loss' then amount else 0 end),0) as loss,
             count(*) filter (where direction='up')::int as upn,
             count(*) filter (where direction='down')::int as downn,
             count(*) filter (where status='win')::int as winc,
             count(*) filter (where status='loss')::int as lossc
      from trades`;
    const recent = await sql<{ d: string; dep: string; wd: string; vol: string }>`
      select to_char(g.d, 'YYYY-MM-DD') as d,
        coalesce((select sum(amount) from deposits where status='approved' and created_at::date = g.d),0) as dep,
        coalesce((select sum(amount) from withdrawals where status in ('approved','paid') and created_at::date = g.d),0) as wd,
        coalesce((select sum(amount) from trades where opened_at::date = g.d),0) as vol
      from generate_series(current_date - 13, current_date, interval '1 day') as g(d)
      order by g.d`;
    void since;
    const depToday = await sql<{ s: string }>`select coalesce(sum(amount),0) as s from deposits where status='approved' and created_at > now() - interval '1 day'`;
    const wdToday = await sql<{ s: string }>`select coalesce(sum(amount),0) as s from withdrawals where status in ('approved','paid') and created_at > now() - interval '1 day'`;
    return {
      users: users[0],
      totalDeposit: n(money[0]?.dep),
      totalWithdraw: n(money[0]?.wd),
      volume: n(trades[0]?.vol),
      totalWin: n(trades[0]?.win),
      totalLoss: n(trades[0]?.loss),
      pnl: n(trades[0]?.loss) - n(trades[0]?.win),
      upCount: trades[0]?.upn ?? 0,
      downCount: trades[0]?.downn ?? 0,
      winCount: trades[0]?.winc ?? 0,
      lossCount: trades[0]?.lossc ?? 0,
      depositToday: n(depToday[0]?.s),
      withdrawToday: n(wdToday[0]?.s),
      series: recent.map((r) => ({ date: r.d, deposit: n(r.dep), withdraw: n(r.wd), volume: n(r.vol) })),
    };
  });

export const listUsers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: { q?: string; page?: number; status?: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const page = Math.max(1, data.page ?? 1);
    const q = data.q?.trim() ? `%${data.q.trim()}%` : null;
    const st = data.status && data.status !== "all" ? data.status : null;
    const rows = await sql<{
      user_id: string;
      display_name: string;
      role: string;
      status: string;
      created_at: unknown;
      email: string;
      balance: string;
      total_deposit: string;
      total_withdraw: string;
    }>`select p.user_id, p.display_name, p.role, p.status, p.created_at, u.email,
              w.balance, w.total_deposit, w.total_withdraw
       from profiles p
       join "user" u on u.id = p.user_id
       join wallets w on w.user_id = p.user_id
       where (${q}::text is null or u.email ilike ${q} or p.display_name ilike ${q})
         and (${st}::text is null or p.status = ${st})
       order by p.created_at desc
       limit 20 offset ${(page - 1) * 20}`;
    const total = await sql<{ c: number }>`
      select count(*)::int as c from profiles p join "user" u on u.id = p.user_id
      where (${q}::text is null or u.email ilike ${q} or p.display_name ilike ${q})
        and (${st}::text is null or p.status = ${st})`;
    return {
      page,
      total: total[0]?.c ?? 0,
      rows: rows.map((r) => ({
        userId: r.user_id,
        displayName: r.display_name,
        email: r.email,
        role: r.role,
        status: r.status,
        createdAt: iso(r.created_at),
        balance: n(r.balance),
        totalDeposit: n(r.total_deposit),
        totalWithdraw: n(r.total_withdraw),
      })),
    };
  });

export const getUserAdmin = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: { userId: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const p = await sql<{
      user_id: string;
      display_name: string;
      phone: string;
      role: string;
      status: string;
      created_at: unknown;
    }>`select user_id, display_name, phone, role, status, created_at from profiles where user_id = ${data.userId}`;
    if (!p[0]) throw new Error("Không tìm thấy user");
    const u = await sql<{ email: string; name: string }>`select email, name from "user" where id = ${data.userId}`;
    const w = await sql<{
      balance: string;
      total_deposit: string;
      total_withdraw: string;
      total_win: string;
      total_loss: string;
      total_volume: string;
    }>`select balance, total_deposit, total_withdraw, total_win, total_loss, total_volume from wallets where user_id = ${data.userId}`;
    const trades = await sql<{
      id: number;
      symbol: string;
      direction: string;
      amount: string;
      status: string;
      profit: string | null;
      opened_at: unknown;
    }>`select t.id, a.symbol, t.direction, t.amount, t.status, t.profit, t.opened_at
       from trades t join assets a on a.id = t.asset_id
       where t.user_id = ${data.userId} order by t.opened_at desc limit 30`;
    const logins = await sql<{ id: number; ip: string; user_agent: string; created_at: unknown }>`
      select id, ip, user_agent, created_at from login_history where user_id = ${data.userId} order by created_at desc limit 20`;
    return {
      userId: p[0].user_id,
      displayName: p[0].display_name,
      phone: p[0].phone,
      role: p[0].role,
      status: p[0].status,
      createdAt: iso(p[0].created_at),
      email: u[0]?.email ?? "",
      wallet: {
        balance: n(w[0]?.balance),
        totalDeposit: n(w[0]?.total_deposit),
        totalWithdraw: n(w[0]?.total_withdraw),
        totalWin: n(w[0]?.total_win),
        totalLoss: n(w[0]?.total_loss),
        totalVolume: n(w[0]?.total_volume),
      },
      trades: trades.map((t) => ({
        id: t.id,
        symbol: t.symbol,
        direction: t.direction,
        amount: n(t.amount),
        status: t.status,
        profit: t.profit == null ? null : n(t.profit),
        openedAt: iso(t.opened_at),
      })),
      logins: logins.map((l) => ({
        id: l.id,
        ip: l.ip,
        userAgent: l.user_agent,
        createdAt: iso(l.created_at),
      })),
    };
  });

export const setUserStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ userId: z.string(), status: z.enum(["active", "locked"]) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    await sql`update profiles set status = ${data.status}, updated_at = now() where user_id = ${data.userId}`;
    await logActivity(sql, context.userId, "admin", "set_user_status", `${data.userId} ${data.status}`);
    return { ok: true };
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ userId: z.string(), role: z.enum(["user", "admin"]) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const me = await requireAdmin(sql, context.userId);
    if (me.role !== "superadmin") throw new Error("Chỉ superadmin được phân quyền");
    await sql`update profiles set role = ${data.role}, updated_at = now() where user_id = ${data.userId}`;
    await logActivity(sql, context.userId, "admin", "set_role", `${data.userId} ${data.role}`);
    return { ok: true };
  });

export const resetUserPassword = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ userId: z.string() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const temp = `Vx${randomBytes(4).toString("hex")}A1`;
    const hash = await hashPassword(temp);
    await sql`update account set password = ${hash}, "updatedAt" = now() where "userId" = ${data.userId} and "providerId" = 'credential'`;
    await logActivity(sql, context.userId, "admin", "reset_password", data.userId);
    return { password: temp };
  });

export const listAdminDeposits = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: { page?: number; status?: string; q?: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const page = Math.max(1, data.page ?? 1);
    const st = data.status && data.status !== "all" ? data.status : null;
    const q = data.q?.trim() ? `%${data.q.trim()}%` : null;
    const rows = await sql<{
      id: number;
      user_id: string;
      email: string;
      amount: string;
      transfer_content: string;
      status: string;
      admin_note: string;
      created_at: unknown;
      reviewed_at: unknown;
    }>`select d.id, d.user_id, u.email, d.amount, d.transfer_content, d.status, d.admin_note, d.created_at, d.reviewed_at
       from deposits d join "user" u on u.id = d.user_id
       where (${st}::text is null or d.status = ${st})
         and (${q}::text is null or u.email ilike ${q} or d.transfer_content ilike ${q} or d.id::text ilike ${q})
       order by d.created_at desc limit 20 offset ${(page - 1) * 20}`;
    const total = await sql<{ c: number }>`select count(*)::int as c from deposits d join "user" u on u.id = d.user_id
       where (${st}::text is null or d.status = ${st})
         and (${q}::text is null or u.email ilike ${q} or d.transfer_content ilike ${q} or d.id::text ilike ${q})`;
    return {
      page,
      total: total[0]?.c ?? 0,
      rows: rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        email: r.email,
        amount: n(r.amount),
        content: r.transfer_content,
        status: r.status,
        note: r.admin_note,
        createdAt: iso(r.created_at),
        reviewedAt: r.reviewed_at ? iso(r.reviewed_at) : null,
      })),
    };
  });

export const reviewDeposit = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.number(), action: z.enum(["approve", "reject"]), note: z.string().optional() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const row = await sql<{ id: number; user_id: string; amount: string; status: string }>`
      select id, user_id, amount, status from deposits where id = ${data.id}`;
    if (!row[0] || row[0].status !== "pending") throw new Error("Yêu cầu không hợp lệ");
    const status = data.action === "approve" ? "approved" : "rejected";
    await sql`update deposits set status = ${status}, admin_note = ${data.note ?? ""}, reviewed_by = ${context.userId}, reviewed_at = now() where id = ${data.id}`;
    if (data.action === "approve") {
      const amt = n(row[0].amount);
      await applyLedger(sql, row[0].user_id, "deposit", amt, "Nap tien duyet", "deposit", data.id);
      await sql`update wallets set total_deposit = total_deposit + ${amt} where user_id = ${row[0].user_id}`;
    }
    await logActivity(sql, context.userId, "admin", "review_deposit", `${data.id} ${status}`);
    return { ok: true };
  });

export const listAdminWithdrawals = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: { page?: number; status?: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const page = Math.max(1, data.page ?? 1);
    const st = data.status && data.status !== "all" ? data.status : null;
    const rows = await sql<{
      id: number;
      user_id: string;
      email: string;
      amount: string;
      bank_name: string;
      account_number: string;
      account_name: string;
      status: string;
      admin_note: string;
      created_at: unknown;
    }>`select w.id, w.user_id, u.email, w.amount, w.bank_name, w.account_number, w.account_name, w.status, w.admin_note, w.created_at
       from withdrawals w join "user" u on u.id = w.user_id
       where (${st}::text is null or w.status = ${st})
       order by w.created_at desc limit 20 offset ${(page - 1) * 20}`;
    const total = await sql<{ c: number }>`select count(*)::int as c from withdrawals w where (${st}::text is null or w.status = ${st})`;
    return {
      page,
      total: total[0]?.c ?? 0,
      rows: rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        email: r.email,
        amount: n(r.amount),
        bankName: r.bank_name,
        accountNumber: r.account_number,
        accountName: r.account_name,
        status: r.status,
        note: r.admin_note,
        createdAt: iso(r.created_at),
      })),
    };
  });

export const reviewWithdraw = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.number(), action: z.enum(["approve", "reject", "paid"]), note: z.string().optional() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const row = await sql<{ id: number; user_id: string; amount: string; status: string }>`
      select id, user_id, amount, status from withdrawals where id = ${data.id}`;
    if (!row[0]) throw new Error("Không tìm thấy");
    if (data.action === "reject") {
      if (row[0].status !== "pending" && row[0].status !== "approved") throw new Error("Không thể từ chối");
      await sql`update withdrawals set status = 'rejected', admin_note = ${data.note ?? ""}, reviewed_by = ${context.userId}, reviewed_at = now() where id = ${data.id}`;
      await applyLedger(sql, row[0].user_id, "adjust", n(row[0].amount), "Hoan rut bi tu choi", "withdraw", data.id);
    } else if (data.action === "approve") {
      if (row[0].status !== "pending") throw new Error("Không thể duyệt");
      await sql`update withdrawals set status = 'approved', admin_note = ${data.note ?? ""}, reviewed_by = ${context.userId}, reviewed_at = now() where id = ${data.id}`;
    } else {
      if (row[0].status !== "approved" && row[0].status !== "pending") throw new Error("Không thể đánh dấu đã trả");
      await sql`update withdrawals set status = 'paid', admin_note = ${data.note ?? ""}, reviewed_by = ${context.userId}, reviewed_at = now() where id = ${data.id}`;
      await sql`update wallets set total_withdraw = total_withdraw + ${n(row[0].amount)} where user_id = ${row[0].user_id}`;
    }
    await logActivity(sql, context.userId, "admin", "review_withdraw", `${data.id} ${data.action}`);
    return { ok: true };
  });

export const listBanksAdmin = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const banks = await sql<{
      id: number;
      bank_name: string;
      bank_code: string;
      account_number: string;
      account_name: string;
      branch: string;
      is_active: boolean;
      is_default: boolean;
    }>`select id, bank_name, bank_code, account_number, account_name, branch, is_active, is_default from bank_accounts order by id`;
    return banks.map((b) => ({
      id: b.id,
      bankName: b.bank_name,
      bankCode: b.bank_code,
      accountNumber: b.account_number,
      accountName: b.account_name,
      branch: b.branch,
      isActive: b.is_active,
      isDefault: b.is_default,
    }));
  });

export const saveBank = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.number().optional(),
      bankName: z.string(),
      bankCode: z.string(),
      accountNumber: z.string(),
      accountName: z.string(),
      branch: z.string(),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    if (data.id) {
      await sql`update bank_accounts set bank_name=${data.bankName}, bank_code=${data.bankCode}, account_number=${data.accountNumber}, account_name=${data.accountName}, branch=${data.branch} where id=${data.id}`;
    } else {
      await sql`insert into bank_accounts (bank_name, bank_code, account_number, account_name, branch) values (${data.bankName}, ${data.bankCode}, ${data.accountNumber}, ${data.accountName}, ${data.branch})`;
    }
    return { ok: true };
  });

export const toggleBank = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.number(), field: z.enum(["active", "default", "delete"]) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    if (data.field === "delete") {
      await sql`delete from bank_accounts where id = ${data.id}`;
    } else if (data.field === "default") {
      await sql`update bank_accounts set is_default = false`;
      await sql`update bank_accounts set is_default = true, is_active = true where id = ${data.id}`;
    } else {
      await sql`update bank_accounts set is_active = not is_active where id = ${data.id}`;
    }
    return { ok: true };
  });

export const listQrAdmin = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const rows = await sql<{ id: number; bank_account_id: number | null; label: string; image_url: string; is_active: boolean }>`
      select id, bank_account_id, label, image_url, is_active from qr_codes order by id`;
    return rows.map((r) => ({
      id: r.id,
      bankAccountId: r.bank_account_id,
      label: r.label,
      imageUrl: r.image_url,
      isActive: r.is_active,
    }));
  });

export const saveQr = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.number().optional(),
      bankAccountId: z.number().nullable(),
      label: z.string(),
      imageUrl: z.string(),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    if (data.id) {
      await sql`update qr_codes set bank_account_id=${data.bankAccountId}, label=${data.label}, image_url=${data.imageUrl} where id=${data.id}`;
    } else {
      await sql`insert into qr_codes (bank_account_id, label, image_url) values (${data.bankAccountId}, ${data.label}, ${data.imageUrl})`;
    }
    return { ok: true };
  });

export const toggleQr = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.number(), del: z.boolean().optional() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    if (data.del) await sql`delete from qr_codes where id = ${data.id}`;
    else await sql`update qr_codes set is_active = not is_active where id = ${data.id}`;
    return { ok: true };
  });

export const listAssetsAdmin = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const assets = await sql<{
      id: number;
      symbol: string;
      name: string;
      base_price: string;
      current_price: string;
      decimals: number;
      payout: string;
      up_ratio: string;
      is_active: boolean;
      trading_paused: boolean;
      trade_start: string | null;
      trade_end: string | null;
    }>`select id, symbol, name, base_price, current_price, decimals, payout, up_ratio, is_active, trading_paused, trade_start, trade_end from assets order by sort_order`;
    const tfs = await sql<{ id: number; seconds: number; label: string; is_active: boolean }>`select id, seconds, label, is_active from timeframes order by seconds`;
    const exps = await sql<{ id: number; seconds: number; label: string; is_active: boolean }>`select id, seconds, label, is_active from expiries order by seconds`;
    return {
      assets: assets.map((a) => ({
        id: a.id,
        symbol: a.symbol,
        name: a.name,
        basePrice: n(a.base_price),
        price: n(a.current_price),
        decimals: a.decimals,
        payout: n(a.payout),
        upRatio: n(a.up_ratio),
        isActive: a.is_active,
        paused: a.trading_paused,
        tradeStart: a.trade_start,
        tradeEnd: a.trade_end,
      })),
      timeframes: tfs,
      expiries: exps,
    };
  });

export const saveAsset = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.number().optional(),
      symbol: z.string(),
      name: z.string(),
      basePrice: z.number(),
      decimals: z.number(),
      payout: z.number(),
      upRatio: z.number(),
      tradeStart: z.string().nullable(),
      tradeEnd: z.string().nullable(),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    if (data.id) {
      await sql`update assets set symbol=${data.symbol}, name=${data.name}, base_price=${data.basePrice}, decimals=${data.decimals}, payout=${data.payout}, up_ratio=${data.upRatio}, trade_start=${data.tradeStart}, trade_end=${data.tradeEnd} where id=${data.id}`;
    } else {
      await sql`insert into assets (symbol, name, base_price, current_price, decimals, payout, up_ratio, trade_start, trade_end)
        values (${data.symbol}, ${data.name}, ${data.basePrice}, ${data.basePrice}, ${data.decimals}, ${data.payout}, ${data.upRatio}, ${data.tradeStart}, ${data.tradeEnd})`;
    }
    return { ok: true };
  });

export const toggleAsset = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.number(), field: z.enum(["active", "paused", "delete"]) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    if (data.field === "delete") await sql`delete from assets where id = ${data.id}`;
    else if (data.field === "paused") await sql`update assets set trading_paused = not trading_paused where id = ${data.id}`;
    else await sql`update assets set is_active = not is_active where id = ${data.id}`;
    return { ok: true };
  });

export const toggleTf = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ kind: z.enum(["tf", "exp"]), id: z.number(), seconds: z.number().optional(), label: z.string().optional() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const table = data.kind === "tf" ? "timeframes" : "expiries";
    if (data.seconds && data.label) {
      if (data.kind === "tf") {
        await sql`insert into timeframes (seconds, label) values (${data.seconds}, ${data.label}) on conflict (seconds) do update set label = excluded.label, is_active = true`;
      } else {
        await sql`insert into expiries (seconds, label) values (${data.seconds}, ${data.label}) on conflict (seconds) do update set label = excluded.label, is_active = true`;
      }
    } else if (data.kind === "tf") {
      await sql`update timeframes set is_active = not is_active where id = ${data.id}`;
    } else {
      await sql`update expiries set is_active = not is_active where id = ${data.id}`;
    }
    void table;
    return { ok: true };
  });

export const listTradesAdmin = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: { page?: number; status?: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const page = Math.max(1, data.page ?? 1);
    const st = data.status && data.status !== "all" ? data.status : null;
    const rows = await sql<{
      id: number;
      email: string;
      symbol: string;
      direction: string;
      amount: string;
      status: string;
      profit: string | null;
      opened_at: unknown;
    }>`select t.id, u.email, a.symbol, t.direction, t.amount, t.status, t.profit, t.opened_at
       from trades t join "user" u on u.id = t.user_id join assets a on a.id = t.asset_id
       where (${st}::text is null or t.status = ${st})
       order by t.opened_at desc limit 30 offset ${(page - 1) * 30}`;
    const total = await sql<{ c: number }>`select count(*)::int as c from trades t where (${st}::text is null or t.status = ${st})`;
    return {
      page,
      total: total[0]?.c ?? 0,
      rows: rows.map((r) => ({
        id: r.id,
        email: r.email,
        symbol: r.symbol,
        direction: r.direction,
        amount: n(r.amount),
        status: r.status,
        profit: r.profit == null ? null : n(r.profit),
        openedAt: iso(r.opened_at),
      })),
    };
  });

export const getSettings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const rows = await sql<{ key: string; value: string }>`select key, value from settings`;
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return map;
  });

export const saveSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.record(z.string(), z.string()))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    for (const [k, v] of Object.entries(data)) {
      await sql`insert into settings (key, value) values (${k}, ${v}) on conflict (key) do update set value = excluded.value`;
    }
    await logActivity(sql, context.userId, "admin", "save_settings", Object.keys(data).join(","));
    return { ok: true };
  });

export const listActivity = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: { page?: number; role?: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const page = Math.max(1, data.page ?? 1);
    const role = data.role && data.role !== "all" ? data.role : null;
    const rows = await sql<{
      id: number;
      user_id: string | null;
      actor_role: string;
      action: string;
      detail: string;
      created_at: unknown;
    }>`select id, user_id, actor_role, action, detail, created_at from activity_logs
       where (${role}::text is null or actor_role = ${role})
       order by created_at desc limit 40 offset ${(page - 1) * 40}`;
    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      role: r.actor_role,
      action: r.action,
      detail: r.detail,
      createdAt: iso(r.created_at),
    }));
  });

export const exportBackup = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const tables = ["profiles", "wallets", "deposits", "withdrawals", "trades", "assets", "settings", "bank_accounts"];
    const dump: Record<string, Record<string, string | number | boolean | null>[]> = {};
    for (const t of tables) {
      dump[t] = await sql.query(`select * from ${t} limit 500`) as Record<string, string | number | boolean | null>[];
    }
    await logActivity(sql, context.userId, "admin", "backup", "");
    return { at: new Date().toISOString(), json: JSON.stringify(dump) };
  });

export const listErrors = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const rows = await sql<{ id: number; message: string; created_at: unknown }>`
      select id, message, created_at from error_logs order by created_at desc limit 50`;
    return rows.map((r) => ({ id: r.id, message: r.message, createdAt: iso(r.created_at) }));
  });
