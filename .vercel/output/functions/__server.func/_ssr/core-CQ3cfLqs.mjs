import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-DfwaDDh6.mjs";
import { a as iso, o as num } from "./format-Bc8Vy2YH.mjs";
import { r as getSql } from "./db-4Pp7elo5.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/core-CQ3cfLqs.js
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
var getBootstrap_createServerFn_handler = createServerRpc({
	id: "aa602569937bb9b52bc442736218771c1c5f9811d93351903f22d51c7ff8999f",
	name: "getBootstrap",
	filename: "src/lib/server/core.ts"
}, (opts) => getBootstrap.__executeServer(opts));
var getBootstrap = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getBootstrap_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const { profile, wallet, isNew } = await ensureProfile(sql, context.userId);
	if (isNew) await sql`insert into login_history (user_id, ip, user_agent) values (${context.userId}, ${""}, ${"first"})`;
	const unread = await sql`
      select count(*)::int as c from notifications n
      where (n.audience = 'all' or n.target_user_id = ${context.userId}
        or (n.audience = 'group' and n.target_group = ${profile.status}))
      and not exists (select 1 from notification_reads r where r.notification_id = n.id and r.user_id = ${context.userId})`;
	const popup = await sql`
      select n.id, n.title, n.body, n.image_url from notifications n
      where n.type in ('popup','both')
        and (n.audience = 'all' or n.target_user_id = ${context.userId})
        and not exists (select 1 from notification_reads r where r.notification_id = n.id and r.user_id = ${context.userId})
      order by n.created_at desc limit 1`;
	return {
		profile,
		wallet,
		unread: unread[0]?.c ?? 0,
		popup: popup[0] ? {
			id: popup[0].id,
			title: popup[0].title,
			body: popup[0].body,
			imageUrl: popup[0].image_url
		} : null
	};
});
//#endregion
export { getBootstrap_createServerFn_handler };
