import { r as createServerFn } from "./ssr.mjs";
import { A as boolean, D as _enum, F as object, P as number, R as string } from "../_libs/@better-auth/core+[...].mjs";
import { t as authMiddleware } from "./middleware-DfwaDDh6.mjs";
import { a as iso } from "./format-Bc8Vy2YH.mjs";
import { i as logActivity, n as ensureProfile, s as requireAdmin } from "./core-hltlGHwq.mjs";
import { r as getSql } from "./db-4Pp7elo5.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cms-BgC92SkI.js
var listSupportPublic_createServerFn_handler = createServerRpc({
	id: "07874c8aa5d754cd3a82c6d657e9fe052c3a71546da7ddbd7c70ee710a30be40",
	name: "listSupportPublic",
	filename: "src/lib/server/cms.ts"
}, (opts) => listSupportPublic.__executeServer(opts));
var listSupportPublic = createServerFn({ method: "GET" }).handler(listSupportPublic_createServerFn_handler, async () => {
	return (await (await getSql())`select id, name, avatar_url, bio, telegram, zalo, messenger, phone from support_agents where is_active = true order by sort_order, id`).map((r) => ({
		id: r.id,
		name: r.name,
		avatarUrl: r.avatar_url,
		bio: r.bio,
		telegram: r.telegram,
		zalo: r.zalo,
		messenger: r.messenger,
		phone: r.phone
	}));
});
var listSupportAdmin_createServerFn_handler = createServerRpc({
	id: "8f8321a4f5d5c0c988fdc00a37285d86f4976fc8b525ba98c5c114642d4644f2",
	name: "listSupportAdmin",
	filename: "src/lib/server/cms.ts"
}, (opts) => listSupportAdmin.__executeServer(opts));
var listSupportAdmin = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listSupportAdmin_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	return (await sql`select id, name, avatar_url, bio, telegram, zalo, messenger, phone, is_active, sort_order from support_agents order by sort_order, id`).map((r) => ({
		id: r.id,
		name: r.name,
		avatarUrl: r.avatar_url,
		bio: r.bio,
		telegram: r.telegram,
		zalo: r.zalo,
		messenger: r.messenger,
		phone: r.phone,
		isActive: r.is_active,
		sortOrder: r.sort_order
	}));
});
var saveSupport_createServerFn_handler = createServerRpc({
	id: "9a38af2b0e5385a65795374580f3c344745ab3c31eea2683e50b7643d4cdab3b",
	name: "saveSupport",
	filename: "src/lib/server/cms.ts"
}, (opts) => saveSupport.__executeServer(opts));
var saveSupport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: number().optional(),
	name: string(),
	avatarUrl: string(),
	bio: string(),
	telegram: string(),
	zalo: string(),
	messenger: string(),
	phone: string(),
	sortOrder: number()
})).handler(saveSupport_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	if (data.id) await sql`update support_agents set name=${data.name}, avatar_url=${data.avatarUrl}, bio=${data.bio}, telegram=${data.telegram}, zalo=${data.zalo}, messenger=${data.messenger}, phone=${data.phone}, sort_order=${data.sortOrder} where id=${data.id}`;
	else await sql`insert into support_agents (name, avatar_url, bio, telegram, zalo, messenger, phone, sort_order)
        values (${data.name}, ${data.avatarUrl}, ${data.bio}, ${data.telegram}, ${data.zalo}, ${data.messenger}, ${data.phone}, ${data.sortOrder})`;
	return { ok: true };
});
var toggleSupport_createServerFn_handler = createServerRpc({
	id: "c938426408e31344e803706f969e6368d87b747917c83a0b803ec2da66fe79dc",
	name: "toggleSupport",
	filename: "src/lib/server/cms.ts"
}, (opts) => toggleSupport.__executeServer(opts));
var toggleSupport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: number(),
	del: boolean().optional()
})).handler(toggleSupport_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	if (data.del) await sql`delete from support_agents where id = ${data.id}`;
	else await sql`update support_agents set is_active = not is_active where id = ${data.id}`;
	return { ok: true };
});
var listNotifications_createServerFn_handler = createServerRpc({
	id: "0da7630bbf2a18de9686d903baec6f233cdd9230c691320eef74a6ecc974030f",
	name: "listNotifications",
	filename: "src/lib/server/cms.ts"
}, (opts) => listNotifications.__executeServer(opts));
var listNotifications = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listNotifications_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const { profile } = await ensureProfile(sql, context.userId);
	return (await sql`select n.id, n.title, n.body, n.image_url, n.type, n.created_at,
              exists(select 1 from notification_reads r where r.notification_id = n.id and r.user_id = ${context.userId}) as read
       from notifications n
       where n.audience = 'all'
          or n.target_user_id = ${context.userId}
          or (n.audience = 'group' and n.target_group = ${profile.status})
       order by n.created_at desc limit 50`).map((r) => ({
		id: r.id,
		title: r.title,
		body: r.body,
		imageUrl: r.image_url,
		type: r.type,
		createdAt: iso(r.created_at),
		read: Boolean(r.read)
	}));
});
var markRead_createServerFn_handler = createServerRpc({
	id: "8de199631b6829d312fd64455233be7f848d6310cb83d9c517de807da0ad2ceb",
	name: "markRead",
	filename: "src/lib/server/cms.ts"
}, (opts) => markRead.__executeServer(opts));
var markRead = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: number() })).handler(markRead_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`insert into notification_reads (notification_id, user_id) values (${data.id}, ${context.userId}) on conflict do nothing`;
	return { ok: true };
});
var listNotificationsAdmin_createServerFn_handler = createServerRpc({
	id: "7d1121aaaa9f09b791f7e401a526473743eb26276de2f9ce3df92892a3ab5264",
	name: "listNotificationsAdmin",
	filename: "src/lib/server/cms.ts"
}, (opts) => listNotificationsAdmin.__executeServer(opts));
var listNotificationsAdmin = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listNotificationsAdmin_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	return (await sql`select n.id, n.title, n.body, n.image_url, n.type, n.audience, n.target_user_id, n.target_group, n.created_at,
              (select count(*)::int from notification_reads r where r.notification_id = n.id) as reads
       from notifications n order by n.created_at desc limit 80`).map((r) => ({
		id: r.id,
		title: r.title,
		body: r.body,
		imageUrl: r.image_url,
		type: r.type,
		audience: r.audience,
		targetUserId: r.target_user_id,
		targetGroup: r.target_group,
		createdAt: iso(r.created_at),
		reads: r.reads
	}));
});
var saveNotification_createServerFn_handler = createServerRpc({
	id: "98c6b42e4cc62748cbffecd4833f78759400bfa4a8de4cbb2bd87f3091dc20d2",
	name: "saveNotification",
	filename: "src/lib/server/cms.ts"
}, (opts) => saveNotification.__executeServer(opts));
var saveNotification = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: number().optional(),
	title: string(),
	body: string(),
	imageUrl: string(),
	type: _enum([
		"in_app",
		"popup",
		"both"
	]),
	audience: _enum([
		"all",
		"user",
		"group"
	]),
	targetUserId: string().nullable(),
	targetGroup: string().nullable()
})).handler(saveNotification_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	if (data.id) await sql`update notifications set title=${data.title}, body=${data.body}, image_url=${data.imageUrl}, type=${data.type}, audience=${data.audience}, target_user_id=${data.targetUserId}, target_group=${data.targetGroup} where id=${data.id}`;
	else await sql`insert into notifications (title, body, image_url, type, audience, target_user_id, target_group, created_by)
        values (${data.title}, ${data.body}, ${data.imageUrl}, ${data.type}, ${data.audience}, ${data.targetUserId}, ${data.targetGroup}, ${context.userId})`;
	await logActivity(sql, context.userId, "admin", "save_notification", data.title);
	return { ok: true };
});
var deleteNotification_createServerFn_handler = createServerRpc({
	id: "0cd3f7ddce3066ce378a34e0607712cc30b584116ac24aad89ceaca8e6a60b85",
	name: "deleteNotification",
	filename: "src/lib/server/cms.ts"
}, (opts) => deleteNotification.__executeServer(opts));
var deleteNotification = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: number() })).handler(deleteNotification_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireAdmin(sql, context.userId);
	await sql`delete from notification_reads where notification_id = ${data.id}`;
	await sql`delete from notifications where id = ${data.id}`;
	return { ok: true };
});
//#endregion
export { deleteNotification_createServerFn_handler, listNotificationsAdmin_createServerFn_handler, listNotifications_createServerFn_handler, listSupportAdmin_createServerFn_handler, listSupportPublic_createServerFn_handler, markRead_createServerFn_handler, saveNotification_createServerFn_handler, saveSupport_createServerFn_handler, toggleSupport_createServerFn_handler };
