import { r as createServerFn } from "./ssr.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { t as authMiddleware } from "./middleware-DfwaDDh6.mjs";
import { a as iso, o as num } from "./format-Bc8Vy2YH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/core-hltlGHwq.js
function n(v) {
	return num(v);
}
async function setting(sql, key, fallback = "") {
	return (await sql`select value from settings where key = ${key}`)[0]?.value ?? fallback;
}
async function logActivity(sql, userId, role, action, detail = "") {
	await sql`insert into activity_logs (user_id, actor_role, action, detail) values (${userId}, ${role}, ${action}, ${detail})`;
}
async function getUserRow(sql, userId) {
	return (await sql`
    select id, name, email, image from "user" where id = ${userId}`)[0] ?? null;
}
async function ensureProfile(sql, userId) {
	const existing = await sql`select user_id, display_name, phone, role, status, totp_enabled, created_at from profiles where user_id = ${userId}`;
	const user = await getUserRow(sql, userId);
	const email = user?.email ?? "";
	const name = user?.name ?? email.split("@")[0] ?? "User";
	if (existing[0]) {
		const wr = (await sql`select balance, total_deposit, total_withdraw, total_win, total_loss, total_volume from wallets where user_id = ${userId}`)[0];
		return {
			profile: {
				userId,
				displayName: existing[0].display_name || name,
				phone: existing[0].phone,
				email,
				role: existing[0].role,
				status: existing[0].status,
				totpEnabled: Boolean(existing[0].totp_enabled),
				createdAt: iso(existing[0].created_at)
			},
			wallet: {
				balance: n(wr?.balance),
				totalDeposit: n(wr?.total_deposit),
				totalWithdraw: n(wr?.total_withdraw),
				totalWin: n(wr?.total_win),
				totalLoss: n(wr?.total_loss),
				totalVolume: n(wr?.total_volume)
			},
			isNew: false
		};
	}
	const role = "user";
	const bonus = n(await setting(sql, "welcome_bonus", "5000000"));
	await sql`insert into profiles (user_id, display_name, role) values (${userId}, ${name}, ${role})`;
	await sql`insert into wallets (user_id, balance) values (${userId}, ${bonus})`;
	if (bonus > 0) await sql`insert into ledger (user_id, type, amount, balance_after, note) values (${userId}, 'bonus', ${bonus}, ${bonus}, 'Thuong chao mung')`;
	await logActivity(sql, userId, role, "register", email);
	return {
		profile: {
			userId,
			displayName: name,
			phone: "",
			email,
			role,
			status: "active",
			totpEnabled: false,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		},
		wallet: {
			balance: bonus,
			totalDeposit: 0,
			totalWithdraw: 0,
			totalWin: 0,
			totalLoss: 0,
			totalVolume: 0
		},
		isNew: true
	};
}
async function requireActiveUser(sql, userId) {
	const { profile, wallet } = await ensureProfile(sql, userId);
	if (profile.status === "locked") throw new Error("Tài khoản đã bị khóa");
	return {
		profile,
		wallet
	};
}
async function requireAdmin(sql, userId) {
	const { profile } = await ensureProfile(sql, userId);
	if (profile.role !== "admin" && profile.role !== "superadmin") throw new Error("Không có quyền quản trị");
	if (profile.status === "locked") throw new Error("Tài khoản đã bị khóa");
	if (profile.totpEnabled) {
		const ok = await sql`select verified_at from admin_2fa_ok where user_id = ${userId}`;
		if (!ok[0]) throw /* @__PURE__ */ new Error("2FA_REQUIRED");
		const t = new Date(iso(ok[0].verified_at)).getTime();
		if (Date.now() - t > 432e5) {
			await sql`delete from admin_2fa_ok where user_id = ${userId}`;
			throw new Error("2FA_REQUIRED");
		}
	}
	return profile;
}
async function applyLedger(sql, userId, type, amount, note, refType, refId) {
	const next = n((await sql`select balance from wallets where user_id = ${userId}`)[0]?.balance) + amount;
	if (next < -.001) throw new Error("Số dư không đủ");
	await sql`update wallets set balance = ${next}, updated_at = now() where user_id = ${userId}`;
	await sql`insert into ledger (user_id, type, amount, balance_after, ref_type, ref_id, note)
    values (${userId}, ${type}, ${amount}, ${next}, ${refType ?? null}, ${refId ?? null}, ${note})`;
	return next;
}
var getBootstrap = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("aa602569937bb9b52bc442736218771c1c5f9811d93351903f22d51c7ff8999f"));
//#endregion
export { n as a, setting as c, logActivity as i, ensureProfile as n, requireActiveUser as o, getBootstrap as r, requireAdmin as s, applyLedger as t };
