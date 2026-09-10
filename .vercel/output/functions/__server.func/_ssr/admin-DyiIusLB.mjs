import { r as createServerFn } from "./ssr.mjs";
import { A as boolean, D as _enum, F as object, L as record, P as number, R as string } from "../_libs/@better-auth/core+[...].mjs";
import { t as authMiddleware } from "./middleware-DfwaDDh6.mjs";
import { a as iso } from "./format-Bc8Vy2YH.mjs";
import { a as n, i as logActivity, n as ensureProfile, s as requireAdmin, t as applyLedger } from "./core-hltlGHwq.mjs";
import { t as hashPassword$1 } from "./password-VlpK0Xix.mjs";
import { r as getSql } from "./db-4Pp7elo5.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { createHmac, randomBytes } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-DyiIusLB.js
var ALPH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32Encode(buf) {
	let bits = 0;
	let value = 0;
	let out = "";
	for (const byte of buf) {
		value = value << 8 | byte;
		bits += 8;
		while (bits >= 5) {
			out += ALPH[value >>> bits - 5 & 31];
			bits -= 5;
		}
	}
	if (bits > 0) out += ALPH[value << 5 - bits & 31];
	return out;
}
function base32Decode(input) {
	const str = input.replace(/=+$/, "").toUpperCase();
	let bits = 0;
	let value = 0;
	const out = [];
	for (const ch of str) {
		const idx = ALPH.indexOf(ch);
		if (idx < 0) continue;
		value = value << 5 | idx;
		bits += 5;
		if (bits >= 8) {
			out.push(value >>> bits - 8 & 255);
			bits -= 8;
		}
	}
	return Buffer.from(out);
}
function generateTotpSecret() {
	return base32Encode(randomBytes(20));
}
function hotp(secret, counter) {
	const key = base32Decode(secret);
	const buf = Buffer.alloc(8);
	buf.writeUInt32BE(Math.floor(counter / 4294967296), 0);
	buf.writeUInt32BE(counter >>> 0, 4);
	const hmac = createHmac("sha1", key).update(buf).digest();
	const offset = hmac[hmac.length - 1] & 15;
	return (((hmac[offset] & 127) << 24 | (hmac[offset + 1] & 255) << 16 | (hmac[offset + 2] & 255) << 8 | hmac[offset + 3] & 255) % 1e6).toString().padStart(6, "0");
}
function verifyTotp(secret, code, window = 1) {
	const trimmed = code.replace(/\s/g, "");
	if (!/^\d{6}$/.test(trimmed) || !secret) return false;
	const step = Math.floor(Date.now() / 1e3 / 30);
	for (let i = -window; i <= window; i++) if (hotp(secret, step + i) === trimmed) return true;
	return false;
}
function totpUri(secret, email) {
	return `otpauth://totp/VERTEX:${encodeURIComponent(email)}?secret=${secret}&issuer=VERTEX&digits=6&period=30`;
}
var SEED_ADMIN_ID = "vertex-seed-admin";
var SEED_ADMIN_EMAIL = "admin@vertex.app";
var SEED_ADMIN_PASSWORD = "phuoc123";
async function ensureSeedAdmin(sql) {
	const hash = await hashPassword$1(SEED_ADMIN_PASSWORD);
	const byId = await sql`select id from "user" where id = ${SEED_ADMIN_ID}`;
	const byEmail = await sql`select id from "user" where email = ${SEED_ADMIN_EMAIL}`;
	let userId = byId[0]?.id ?? byEmail[0]?.id;
	if (!userId) {
		userId = SEED_ADMIN_ID;
		await sql`
      insert into "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
      values (${userId}, 'Admin', ${SEED_ADMIN_EMAIL}, true, now(), now())`;
	} else await sql`update "user" set email = ${SEED_ADMIN_EMAIL}, name = 'Admin', "updatedAt" = now() where id = ${userId}`;
	const acct = await sql`
    select id from account where "userId" = ${userId} and "providerId" = 'credential'`;
	if (acct[0]) await sql`update account set password = ${hash}, "updatedAt" = now() where id = ${acct[0].id}`;
	else await sql`
      insert into account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
      values (${`${userId}-credential`}, ${userId}, 'credential', ${userId}, ${hash}, now(), now())`;
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
var prepareAdminLogin_createServerFn_handler = createServerRpc({
	id: "cc529a2d3608d15080fef9017ac7a2e81afe63b28170899048f2b24cb7830e22",
	name: "prepareAdminLogin",
	filename: "src/lib/server/admin.ts"
}, (opts) => prepareAdminLogin.__executeServer(opts));
var prepareAdminLogin = createServerFn({ method: "GET" }).handler(prepareAdminLogin_createServerFn_handler, async () => {
	return ensureSeedAdmin(await getSql());
});
var adminPing_createServerFn_handler = createServerRpc({
	id: "8801c47e08d3a38966f12b2bdc24e1bd6aea79179abc2d000523a830eacb5c74",
	name: "adminPing",
	filename: "src/lib/server/admin.ts"
}, (opts) => adminPing.__executeServer(opts));
var adminPing = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(adminPing_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const { profile } = await ensureProfile(sql, context.userId);
	const isAdmin = profile.role === "admin" || profile.role === "superadmin";
	let twoFa = false;
	if (isAdmin && profile.totpEnabled) {
		const ok = await sql`select verified_at from admin_2fa_ok where user_id = ${context.userId}`;
		twoFa = Boolean(ok[0]) && Date.now() - new Date(iso(ok[0].verified_at)).getTime() < 432e5;
	}
	return {
		isAdmin,
		totpEnabled: profile.totpEnabled,
		twoFaOk: !profile.totpEnabled || twoFa,
		role: profile.role,
		status: profile.status
	};
});
var verifyAdmin2fa_createServerFn_handler = createServerRpc({
	id: "27c52b357740d9581847e114cdca19ce9891feaf6875a8cd7e0c9af8d9ceb8bb",
	name: "verifyAdmin2fa",
	filename: "src/lib/server/admin.ts"
}, (opts) => verifyAdmin2fa.__executeServer(opts));
var verifyAdmin2fa = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ code: string() })).handler(verifyAdmin2fa_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const { profile } = await ensureProfile(sql, context.userId);
	if (profile.role !== "admin" && profile.role !== "superadmin") throw new Error("Không có quyền");
	const row = await sql`
      select totp_secret, totp_enabled from profiles where user_id = ${context.userId}`;
	if (!row[0]?.totp_enabled || !row[0].totp_secret) throw new Error("Chưa bật 2FA");
	if (!verifyTotp(row[0].totp_secret, data.code)) throw new Error("Mã 2FA không đúng");
	await sql`insert into admin_2fa_ok (user_id, verified_at) values (${context.userId}, now())
      on conflict (user_id) do update set verified_at = now()`;
	return { ok: true };
});
var setupAdmin2fa_createServerFn_handler = createServerRpc({
	id: "9f17fa6b180718e24f3b9d1f07567e0697ea2b2b514e61cd968aa2ed1d22dad3",
	name: "setupAdmin2fa",
	filename: "src/lib/server/admin.ts"
}, (opts) => setupAdmin2fa.__executeServer(opts));
var setupAdmin2fa = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(setupAdmin2fa_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId).catch(async (e) => {
		if (String(e.message) !== "2FA_REQUIRED") throw e;
	});
	const { profile } = await ensureProfile(sql, context.userId);
	if (profile.role !== "admin" && profile.role !== "superadmin") throw new Error("Không có quyền");
	const secret = generateTotpSecret();
	await sql`update profiles set totp_secret = ${secret}, totp_enabled = false where user_id = ${context.userId}`;
	return {
		secret,
		uri: totpUri(secret, profile.email || "admin")
	};
});
var confirmAdmin2fa_createServerFn_handler = createServerRpc({
	id: "bd33ba3e8a3c9b05f3873e1edbbf67f9542cfa2071af349a37a5062e45d130d2",
	name: "confirmAdmin2fa",
	filename: "src/lib/server/admin.ts"
}, (opts) => confirmAdmin2fa.__executeServer(opts));
var confirmAdmin2fa = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ code: string() })).handler(confirmAdmin2fa_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const row = await sql`select totp_secret from profiles where user_id = ${context.userId}`;
	if (!row[0]?.totp_secret || !verifyTotp(row[0].totp_secret, data.code)) throw new Error("Mã không đúng");
	await sql`update profiles set totp_enabled = true where user_id = ${context.userId}`;
	await sql`insert into admin_2fa_ok (user_id, verified_at) values (${context.userId}, now())
      on conflict (user_id) do update set verified_at = now()`;
	return { ok: true };
});
var disableAdmin2fa_createServerFn_handler = createServerRpc({
	id: "9bb043575839e6e51b55dbc27927287de12dec7e1546559737f7cd0fde7d20d9",
	name: "disableAdmin2fa",
	filename: "src/lib/server/admin.ts"
}, (opts) => disableAdmin2fa.__executeServer(opts));
var disableAdmin2fa = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ code: string() })).handler(disableAdmin2fa_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	const row = await sql`select totp_secret from profiles where user_id = ${context.userId}`;
	if (!row[0]?.totp_secret || !verifyTotp(row[0].totp_secret, data.code)) throw new Error("Mã không đúng");
	await sql`update profiles set totp_enabled = false, totp_secret = null where user_id = ${context.userId}`;
	await sql`delete from admin_2fa_ok where user_id = ${context.userId}`;
	return { ok: true };
});
var getDashboard_createServerFn_handler = createServerRpc({
	id: "a4d1e1a0fbd35f1887b311ded858b2b2fa1a387726501a02ca3b8473cc2c267a",
	name: "getDashboard",
	filename: "src/lib/server/admin.ts"
}, (opts) => getDashboard.__executeServer(opts));
var getDashboard = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(getDashboard_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	data.range;
	const users = await sql`
      select count(*)::int as total,
             count(*) filter (where created_at > now() - interval '1 day')::int as neu,
             count(*) filter (where status = 'locked')::int as locked,
             count(*) filter (where status = 'active')::int as active
      from profiles`;
	const money = await sql`
      select coalesce(sum(total_deposit),0) as dep, coalesce(sum(total_withdraw),0) as wd from wallets`;
	const trades = await sql`
      select coalesce(sum(amount),0) as vol,
             coalesce(sum(case when status='win' then profit else 0 end),0) as win,
             coalesce(sum(case when status='loss' then amount else 0 end),0) as loss,
             count(*) filter (where direction='up')::int as upn,
             count(*) filter (where direction='down')::int as downn,
             count(*) filter (where status='win')::int as winc,
             count(*) filter (where status='loss')::int as lossc
      from trades`;
	const recent = await sql`
      select to_char(g.d, 'YYYY-MM-DD') as d,
        coalesce((select sum(amount) from deposits where status='approved' and created_at::date = g.d),0) as dep,
        coalesce((select sum(amount) from withdrawals where status in ('approved','paid') and created_at::date = g.d),0) as wd,
        coalesce((select sum(amount) from trades where opened_at::date = g.d),0) as vol
      from generate_series(current_date - 13, current_date, interval '1 day') as g(d)
      order by g.d`;
	const depToday = await sql`select coalesce(sum(amount),0) as s from deposits where status='approved' and created_at > now() - interval '1 day'`;
	const wdToday = await sql`select coalesce(sum(amount),0) as s from withdrawals where status in ('approved','paid') and created_at > now() - interval '1 day'`;
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
		series: recent.map((r) => ({
			date: r.d,
			deposit: n(r.dep),
			withdraw: n(r.wd),
			volume: n(r.vol)
		}))
	};
});
var listUsers_createServerFn_handler = createServerRpc({
	id: "8ff428842bb49781522d3045308fc4b9413c4565e4912c7391c8e5ad80c3b07b",
	name: "listUsers",
	filename: "src/lib/server/admin.ts"
}, (opts) => listUsers.__executeServer(opts));
var listUsers = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(listUsers_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	const page = Math.max(1, data.page ?? 1);
	const q = data.q?.trim() ? `%${data.q.trim()}%` : null;
	const st = data.status && data.status !== "all" ? data.status : null;
	const rows = await sql`select p.user_id, p.display_name, p.role, p.status, p.created_at, u.email,
              w.balance, w.total_deposit, w.total_withdraw
       from profiles p
       join "user" u on u.id = p.user_id
       join wallets w on w.user_id = p.user_id
       where (${q}::text is null or u.email ilike ${q} or p.display_name ilike ${q})
         and (${st}::text is null or p.status = ${st})
       order by p.created_at desc
       limit 20 offset ${(page - 1) * 20}`;
	return {
		page,
		total: (await sql`
      select count(*)::int as c from profiles p join "user" u on u.id = p.user_id
      where (${q}::text is null or u.email ilike ${q} or p.display_name ilike ${q})
        and (${st}::text is null or p.status = ${st})`)[0]?.c ?? 0,
		rows: rows.map((r) => ({
			userId: r.user_id,
			displayName: r.display_name,
			email: r.email,
			role: r.role,
			status: r.status,
			createdAt: iso(r.created_at),
			balance: n(r.balance),
			totalDeposit: n(r.total_deposit),
			totalWithdraw: n(r.total_withdraw)
		}))
	};
});
var getUserAdmin_createServerFn_handler = createServerRpc({
	id: "a59c9da0ab03659722ae81b20ba7ff223815ab798bbd86f845650e2eecfd8c7d",
	name: "getUserAdmin",
	filename: "src/lib/server/admin.ts"
}, (opts) => getUserAdmin.__executeServer(opts));
var getUserAdmin = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(getUserAdmin_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	const p = await sql`select user_id, display_name, phone, role, status, created_at from profiles where user_id = ${data.userId}`;
	if (!p[0]) throw new Error("Không tìm thấy user");
	const u = await sql`select email, name from "user" where id = ${data.userId}`;
	const w = await sql`select balance, total_deposit, total_withdraw, total_win, total_loss, total_volume from wallets where user_id = ${data.userId}`;
	const trades = await sql`select t.id, a.symbol, t.direction, t.amount, t.status, t.profit, t.opened_at
       from trades t join assets a on a.id = t.asset_id
       where t.user_id = ${data.userId} order by t.opened_at desc limit 30`;
	const logins = await sql`
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
			totalVolume: n(w[0]?.total_volume)
		},
		trades: trades.map((t) => ({
			id: t.id,
			symbol: t.symbol,
			direction: t.direction,
			amount: n(t.amount),
			status: t.status,
			profit: t.profit == null ? null : n(t.profit),
			openedAt: iso(t.opened_at)
		})),
		logins: logins.map((l) => ({
			id: l.id,
			ip: l.ip,
			userAgent: l.user_agent,
			createdAt: iso(l.created_at)
		}))
	};
});
var setUserStatus_createServerFn_handler = createServerRpc({
	id: "56990600344cbf743830ade475286d52b2d8720f63fbc4e55b17c2a6b289a76c",
	name: "setUserStatus",
	filename: "src/lib/server/admin.ts"
}, (opts) => setUserStatus.__executeServer(opts));
var setUserStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	userId: string(),
	status: _enum(["active", "locked"])
})).handler(setUserStatus_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	await sql`update profiles set status = ${data.status}, updated_at = now() where user_id = ${data.userId}`;
	await logActivity(sql, context.userId, "admin", "set_user_status", `${data.userId} ${data.status}`);
	return { ok: true };
});
var setUserRole_createServerFn_handler = createServerRpc({
	id: "ac3f811a02d228af5c22de1cb1fe741feaa6d4ac380686214453278a57b4d919",
	name: "setUserRole",
	filename: "src/lib/server/admin.ts"
}, (opts) => setUserRole.__executeServer(opts));
var setUserRole = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	userId: string(),
	role: _enum(["user", "admin"])
})).handler(setUserRole_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if ((await requireAdmin(sql, context.userId)).role !== "superadmin") throw new Error("Chỉ superadmin được phân quyền");
	await sql`update profiles set role = ${data.role}, updated_at = now() where user_id = ${data.userId}`;
	await logActivity(sql, context.userId, "admin", "set_role", `${data.userId} ${data.role}`);
	return { ok: true };
});
var resetUserPassword_createServerFn_handler = createServerRpc({
	id: "dcbe79a1566b9bf039eea75f955c6727d3fdc8e144f84bf2b780aec4c1d6f02b",
	name: "resetUserPassword",
	filename: "src/lib/server/admin.ts"
}, (opts) => resetUserPassword.__executeServer(opts));
var resetUserPassword = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ userId: string() })).handler(resetUserPassword_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	const temp = `Vx${randomBytes(4).toString("hex")}A1`;
	await sql`update account set password = ${await hashPassword$1(temp)}, "updatedAt" = now() where "userId" = ${data.userId} and "providerId" = 'credential'`;
	await logActivity(sql, context.userId, "admin", "reset_password", data.userId);
	return { password: temp };
});
var listAdminDeposits_createServerFn_handler = createServerRpc({
	id: "23bdc7359784c4e4743047c4bc44b5604a24cab6c046f04f67fc12943e7ccc08",
	name: "listAdminDeposits",
	filename: "src/lib/server/admin.ts"
}, (opts) => listAdminDeposits.__executeServer(opts));
var listAdminDeposits = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(listAdminDeposits_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	const page = Math.max(1, data.page ?? 1);
	const st = data.status && data.status !== "all" ? data.status : null;
	const q = data.q?.trim() ? `%${data.q.trim()}%` : null;
	const rows = await sql`select d.id, d.user_id, u.email, d.amount, d.transfer_content, d.status, d.admin_note, d.created_at, d.reviewed_at
       from deposits d join "user" u on u.id = d.user_id
       where (${st}::text is null or d.status = ${st})
         and (${q}::text is null or u.email ilike ${q} or d.transfer_content ilike ${q} or d.id::text ilike ${q})
       order by d.created_at desc limit 20 offset ${(page - 1) * 20}`;
	return {
		page,
		total: (await sql`select count(*)::int as c from deposits d join "user" u on u.id = d.user_id
       where (${st}::text is null or d.status = ${st})
         and (${q}::text is null or u.email ilike ${q} or d.transfer_content ilike ${q} or d.id::text ilike ${q})`)[0]?.c ?? 0,
		rows: rows.map((r) => ({
			id: r.id,
			userId: r.user_id,
			email: r.email,
			amount: n(r.amount),
			content: r.transfer_content,
			status: r.status,
			note: r.admin_note,
			createdAt: iso(r.created_at),
			reviewedAt: r.reviewed_at ? iso(r.reviewed_at) : null
		}))
	};
});
var reviewDeposit_createServerFn_handler = createServerRpc({
	id: "de88e7ba3adabab54f9a952e2f50dfe92c40c443bdaa947d59b0c5fc8606aea4",
	name: "reviewDeposit",
	filename: "src/lib/server/admin.ts"
}, (opts) => reviewDeposit.__executeServer(opts));
var reviewDeposit = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: number(),
	action: _enum(["approve", "reject"]),
	note: string().optional()
})).handler(reviewDeposit_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	const row = await sql`
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
var listAdminWithdrawals_createServerFn_handler = createServerRpc({
	id: "c9f96fdd86815518d2fac5c0666f870992d0412f33b29c9ad1c019e13ef65a26",
	name: "listAdminWithdrawals",
	filename: "src/lib/server/admin.ts"
}, (opts) => listAdminWithdrawals.__executeServer(opts));
var listAdminWithdrawals = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(listAdminWithdrawals_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	const page = Math.max(1, data.page ?? 1);
	const st = data.status && data.status !== "all" ? data.status : null;
	const rows = await sql`select w.id, w.user_id, u.email, w.amount, w.bank_name, w.account_number, w.account_name, w.status, w.admin_note, w.created_at
       from withdrawals w join "user" u on u.id = w.user_id
       where (${st}::text is null or w.status = ${st})
       order by w.created_at desc limit 20 offset ${(page - 1) * 20}`;
	return {
		page,
		total: (await sql`select count(*)::int as c from withdrawals w where (${st}::text is null or w.status = ${st})`)[0]?.c ?? 0,
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
			createdAt: iso(r.created_at)
		}))
	};
});
var reviewWithdraw_createServerFn_handler = createServerRpc({
	id: "5698905ba84bb9adf99a3c60d664e4309c13b1ee4c52406dbde3a14a35508df8",
	name: "reviewWithdraw",
	filename: "src/lib/server/admin.ts"
}, (opts) => reviewWithdraw.__executeServer(opts));
var reviewWithdraw = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: number(),
	action: _enum([
		"approve",
		"reject",
		"paid"
	]),
	note: string().optional()
})).handler(reviewWithdraw_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	const row = await sql`
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
var listBanksAdmin_createServerFn_handler = createServerRpc({
	id: "ad2c745fdaf5a96052f8371ab4ee39760e359b551aa7158f9fca3fff11c20630",
	name: "listBanksAdmin",
	filename: "src/lib/server/admin.ts"
}, (opts) => listBanksAdmin.__executeServer(opts));
var listBanksAdmin = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listBanksAdmin_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	return (await sql`select id, bank_name, bank_code, account_number, account_name, branch, is_active, is_default from bank_accounts order by id`).map((b) => ({
		id: b.id,
		bankName: b.bank_name,
		bankCode: b.bank_code,
		accountNumber: b.account_number,
		accountName: b.account_name,
		branch: b.branch,
		isActive: b.is_active,
		isDefault: b.is_default
	}));
});
var saveBank_createServerFn_handler = createServerRpc({
	id: "f9e4e9f3b86a1ddfe5c89c0199969d488a6474b8875e666e904048f5574a284a",
	name: "saveBank",
	filename: "src/lib/server/admin.ts"
}, (opts) => saveBank.__executeServer(opts));
var saveBank = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: number().optional(),
	bankName: string(),
	bankCode: string(),
	accountNumber: string(),
	accountName: string(),
	branch: string()
})).handler(saveBank_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	if (data.id) await sql`update bank_accounts set bank_name=${data.bankName}, bank_code=${data.bankCode}, account_number=${data.accountNumber}, account_name=${data.accountName}, branch=${data.branch} where id=${data.id}`;
	else await sql`insert into bank_accounts (bank_name, bank_code, account_number, account_name, branch) values (${data.bankName}, ${data.bankCode}, ${data.accountNumber}, ${data.accountName}, ${data.branch})`;
	return { ok: true };
});
var toggleBank_createServerFn_handler = createServerRpc({
	id: "599e24450415aac4140e08db14ee0f5aaca59e4b8b2e425c45f3cd9e294c6717",
	name: "toggleBank",
	filename: "src/lib/server/admin.ts"
}, (opts) => toggleBank.__executeServer(opts));
var toggleBank = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: number(),
	field: _enum([
		"active",
		"default",
		"delete"
	])
})).handler(toggleBank_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	if (data.field === "delete") await sql`delete from bank_accounts where id = ${data.id}`;
	else if (data.field === "default") {
		await sql`update bank_accounts set is_default = false`;
		await sql`update bank_accounts set is_default = true, is_active = true where id = ${data.id}`;
	} else await sql`update bank_accounts set is_active = not is_active where id = ${data.id}`;
	return { ok: true };
});
var listQrAdmin_createServerFn_handler = createServerRpc({
	id: "1ded30c7226a839044add67c90cb9d1e260545561c852b646dd80e201f341b38",
	name: "listQrAdmin",
	filename: "src/lib/server/admin.ts"
}, (opts) => listQrAdmin.__executeServer(opts));
var listQrAdmin = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listQrAdmin_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	return (await sql`
      select id, bank_account_id, label, image_url, is_active from qr_codes order by id`).map((r) => ({
		id: r.id,
		bankAccountId: r.bank_account_id,
		label: r.label,
		imageUrl: r.image_url,
		isActive: r.is_active
	}));
});
var saveQr_createServerFn_handler = createServerRpc({
	id: "5cd9983f36239101018c6e857f7db6a6aa29c2ec43962a5b71f04529e3869cd5",
	name: "saveQr",
	filename: "src/lib/server/admin.ts"
}, (opts) => saveQr.__executeServer(opts));
var saveQr = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: number().optional(),
	bankAccountId: number().nullable(),
	label: string(),
	imageUrl: string()
})).handler(saveQr_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	if (data.id) await sql`update qr_codes set bank_account_id=${data.bankAccountId}, label=${data.label}, image_url=${data.imageUrl} where id=${data.id}`;
	else await sql`insert into qr_codes (bank_account_id, label, image_url) values (${data.bankAccountId}, ${data.label}, ${data.imageUrl})`;
	return { ok: true };
});
var toggleQr_createServerFn_handler = createServerRpc({
	id: "e2abe9247140c0ee33d75c339e025f32c45eaee303cce45dc7447eaa05212d0f",
	name: "toggleQr",
	filename: "src/lib/server/admin.ts"
}, (opts) => toggleQr.__executeServer(opts));
var toggleQr = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: number(),
	del: boolean().optional()
})).handler(toggleQr_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	if (data.del) await sql`delete from qr_codes where id = ${data.id}`;
	else await sql`update qr_codes set is_active = not is_active where id = ${data.id}`;
	return { ok: true };
});
var listAssetsAdmin_createServerFn_handler = createServerRpc({
	id: "7965c6be1cce514e3fc3a77edd4632a7d64aed5f2e4d796a82d65fd06d3c9de5",
	name: "listAssetsAdmin",
	filename: "src/lib/server/admin.ts"
}, (opts) => listAssetsAdmin.__executeServer(opts));
var listAssetsAdmin = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listAssetsAdmin_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	const assets = await sql`select id, symbol, name, base_price, current_price, decimals, payout, up_ratio, is_active, trading_paused, trade_start, trade_end from assets order by sort_order`;
	const tfs = await sql`select id, seconds, label, is_active from timeframes order by seconds`;
	const exps = await sql`select id, seconds, label, is_active from expiries order by seconds`;
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
			tradeEnd: a.trade_end
		})),
		timeframes: tfs,
		expiries: exps
	};
});
var saveAsset_createServerFn_handler = createServerRpc({
	id: "028fea6d263a55e815387bf4ca9d0748c527e54ba23f58928d5da27828cd3479",
	name: "saveAsset",
	filename: "src/lib/server/admin.ts"
}, (opts) => saveAsset.__executeServer(opts));
var saveAsset = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: number().optional(),
	symbol: string(),
	name: string(),
	basePrice: number(),
	decimals: number(),
	payout: number(),
	upRatio: number(),
	tradeStart: string().nullable(),
	tradeEnd: string().nullable()
})).handler(saveAsset_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	if (data.id) await sql`update assets set symbol=${data.symbol}, name=${data.name}, base_price=${data.basePrice}, decimals=${data.decimals}, payout=${data.payout}, up_ratio=${data.upRatio}, trade_start=${data.tradeStart}, trade_end=${data.tradeEnd} where id=${data.id}`;
	else await sql`insert into assets (symbol, name, base_price, current_price, decimals, payout, up_ratio, trade_start, trade_end)
        values (${data.symbol}, ${data.name}, ${data.basePrice}, ${data.basePrice}, ${data.decimals}, ${data.payout}, ${data.upRatio}, ${data.tradeStart}, ${data.tradeEnd})`;
	return { ok: true };
});
var toggleAsset_createServerFn_handler = createServerRpc({
	id: "93f9e17a216c0c1128d5986ae0b1ab256f5518c61568c1c6f294ef22553cc79e",
	name: "toggleAsset",
	filename: "src/lib/server/admin.ts"
}, (opts) => toggleAsset.__executeServer(opts));
var toggleAsset = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: number(),
	field: _enum([
		"active",
		"paused",
		"delete"
	])
})).handler(toggleAsset_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	if (data.field === "delete") await sql`delete from assets where id = ${data.id}`;
	else if (data.field === "paused") await sql`update assets set trading_paused = not trading_paused where id = ${data.id}`;
	else await sql`update assets set is_active = not is_active where id = ${data.id}`;
	return { ok: true };
});
var toggleTf_createServerFn_handler = createServerRpc({
	id: "43d44d2ffbd134306d5b291f2a47a83cca0e1fdae08994874e382b61c303536e",
	name: "toggleTf",
	filename: "src/lib/server/admin.ts"
}, (opts) => toggleTf.__executeServer(opts));
var toggleTf = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	kind: _enum(["tf", "exp"]),
	id: number(),
	seconds: number().optional(),
	label: string().optional()
})).handler(toggleTf_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	data.kind;
	if (data.seconds && data.label) {
		if (data.kind === "tf") await sql`insert into timeframes (seconds, label) values (${data.seconds}, ${data.label}) on conflict (seconds) do update set label = excluded.label, is_active = true`;
		else await sql`insert into expiries (seconds, label) values (${data.seconds}, ${data.label}) on conflict (seconds) do update set label = excluded.label, is_active = true`;
	} else if (data.kind === "tf") await sql`update timeframes set is_active = not is_active where id = ${data.id}`;
	else await sql`update expiries set is_active = not is_active where id = ${data.id}`;
	return { ok: true };
});
var listTradesAdmin_createServerFn_handler = createServerRpc({
	id: "81d605ea100d712c7f73db37c530bf718a9680a5438da1ac8c03d6ade3b8494b",
	name: "listTradesAdmin",
	filename: "src/lib/server/admin.ts"
}, (opts) => listTradesAdmin.__executeServer(opts));
var listTradesAdmin = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(listTradesAdmin_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	const page = Math.max(1, data.page ?? 1);
	const st = data.status && data.status !== "all" ? data.status : null;
	const rows = await sql`select t.id, u.email, a.symbol, t.direction, t.amount, t.status, t.profit, t.opened_at
       from trades t join "user" u on u.id = t.user_id join assets a on a.id = t.asset_id
       where (${st}::text is null or t.status = ${st})
       order by t.opened_at desc limit 30 offset ${(page - 1) * 30}`;
	return {
		page,
		total: (await sql`select count(*)::int as c from trades t where (${st}::text is null or t.status = ${st})`)[0]?.c ?? 0,
		rows: rows.map((r) => ({
			id: r.id,
			email: r.email,
			symbol: r.symbol,
			direction: r.direction,
			amount: n(r.amount),
			status: r.status,
			profit: r.profit == null ? null : n(r.profit),
			openedAt: iso(r.opened_at)
		}))
	};
});
var getSettings_createServerFn_handler = createServerRpc({
	id: "f8a0b8eca9795930374684cec3e0f28d307d4e92df95beb06334ed0304cdb8eb",
	name: "getSettings",
	filename: "src/lib/server/admin.ts"
}, (opts) => getSettings.__executeServer(opts));
var getSettings = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getSettings_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	const rows = await sql`select key, value from settings`;
	const map = {};
	for (const r of rows) map[r.key] = r.value;
	return map;
});
var saveSettings_createServerFn_handler = createServerRpc({
	id: "c2e088d673ccff2c8e6325f78aa413af66c01db491d13cf76f532e67bb73b352",
	name: "saveSettings",
	filename: "src/lib/server/admin.ts"
}, (opts) => saveSettings.__executeServer(opts));
var saveSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(record(string(), string())).handler(saveSettings_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	for (const [k, v] of Object.entries(data)) await sql`insert into settings (key, value) values (${k}, ${v}) on conflict (key) do update set value = excluded.value`;
	await logActivity(sql, context.userId, "admin", "save_settings", Object.keys(data).join(","));
	return { ok: true };
});
var listActivity_createServerFn_handler = createServerRpc({
	id: "2a7d968c513ce071a5d788fd8dbbb236c53b8ec57d31fcc2b8e98f65f53ba88f",
	name: "listActivity",
	filename: "src/lib/server/admin.ts"
}, (opts) => listActivity.__executeServer(opts));
var listActivity = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(listActivity_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	const page = Math.max(1, data.page ?? 1);
	const role = data.role && data.role !== "all" ? data.role : null;
	return (await sql`select id, user_id, actor_role, action, detail, created_at from activity_logs
       where (${role}::text is null or actor_role = ${role})
       order by created_at desc limit 40 offset ${(page - 1) * 40}`).map((r) => ({
		id: r.id,
		userId: r.user_id,
		role: r.actor_role,
		action: r.action,
		detail: r.detail,
		createdAt: iso(r.created_at)
	}));
});
var exportBackup_createServerFn_handler = createServerRpc({
	id: "d7c6a69f39ab53100e0a25f156adf3ad6be8f400a2a706eb6728844917a58c60",
	name: "exportBackup",
	filename: "src/lib/server/admin.ts"
}, (opts) => exportBackup.__executeServer(opts));
var exportBackup = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(exportBackup_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	const tables = [
		"profiles",
		"wallets",
		"deposits",
		"withdrawals",
		"trades",
		"assets",
		"settings",
		"bank_accounts"
	];
	const dump = {};
	for (const t of tables) dump[t] = await sql.query(`select * from ${t} limit 500`);
	await logActivity(sql, context.userId, "admin", "backup", "");
	return {
		at: (/* @__PURE__ */ new Date()).toISOString(),
		json: JSON.stringify(dump)
	};
});
var listErrors_createServerFn_handler = createServerRpc({
	id: "ed2f3e8fe534ff51303bae29c08ec52e6591d12054ae31a8576dff75175cea34",
	name: "listErrors",
	filename: "src/lib/server/admin.ts"
}, (opts) => listErrors.__executeServer(opts));
var listErrors = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listErrors_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	return (await sql`
      select id, message, created_at from error_logs order by created_at desc limit 50`).map((r) => ({
		id: r.id,
		message: r.message,
		createdAt: iso(r.created_at)
	}));
});
//#endregion
export { adminPing_createServerFn_handler, confirmAdmin2fa_createServerFn_handler, disableAdmin2fa_createServerFn_handler, exportBackup_createServerFn_handler, getDashboard_createServerFn_handler, getSettings_createServerFn_handler, getUserAdmin_createServerFn_handler, listActivity_createServerFn_handler, listAdminDeposits_createServerFn_handler, listAdminWithdrawals_createServerFn_handler, listAssetsAdmin_createServerFn_handler, listBanksAdmin_createServerFn_handler, listErrors_createServerFn_handler, listQrAdmin_createServerFn_handler, listTradesAdmin_createServerFn_handler, listUsers_createServerFn_handler, prepareAdminLogin_createServerFn_handler, resetUserPassword_createServerFn_handler, reviewDeposit_createServerFn_handler, reviewWithdraw_createServerFn_handler, saveAsset_createServerFn_handler, saveBank_createServerFn_handler, saveQr_createServerFn_handler, saveSettings_createServerFn_handler, setUserRole_createServerFn_handler, setUserStatus_createServerFn_handler, setupAdmin2fa_createServerFn_handler, toggleAsset_createServerFn_handler, toggleBank_createServerFn_handler, toggleQr_createServerFn_handler, toggleTf_createServerFn_handler, verifyAdmin2fa_createServerFn_handler };
