import { r as createServerFn } from "./ssr.mjs";
import { A as boolean, D as _enum, F as object, P as number, R as string } from "../_libs/@better-auth/core+[...].mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { t as authMiddleware } from "./middleware-DfwaDDh6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cms-PRMuySGH.js
var listSupportPublic = createServerFn({ method: "GET" }).handler(createSsrRpc("07874c8aa5d754cd3a82c6d657e9fe052c3a71546da7ddbd7c70ee710a30be40"));
var listSupportAdmin = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("8f8321a4f5d5c0c988fdc00a37285d86f4976fc8b525ba98c5c114642d4644f2"));
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
})).handler(createSsrRpc("9a38af2b0e5385a65795374580f3c344745ab3c31eea2683e50b7643d4cdab3b"));
var toggleSupport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: number(),
	del: boolean().optional()
})).handler(createSsrRpc("c938426408e31344e803706f969e6368d87b747917c83a0b803ec2da66fe79dc"));
var listNotifications = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("0da7630bbf2a18de9686d903baec6f233cdd9230c691320eef74a6ecc974030f"));
var markRead = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: number() })).handler(createSsrRpc("8de199631b6829d312fd64455233be7f848d6310cb83d9c517de807da0ad2ceb"));
var listNotificationsAdmin = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("7d1121aaaa9f09b791f7e401a526473743eb26276de2f9ce3df92892a3ab5264"));
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
})).handler(createSsrRpc("98c6b42e4cc62748cbffecd4833f78759400bfa4a8de4cbb2bd87f3091dc20d2"));
var deleteNotification = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: number() })).handler(createSsrRpc("0cd3f7ddce3066ce378a34e0607712cc30b584116ac24aad89ceaca8e6a60b85"));
//#endregion
export { listSupportPublic as a, saveSupport as c, listSupportAdmin as i, toggleSupport as l, listNotifications as n, markRead as o, listNotificationsAdmin as r, saveNotification as s, deleteNotification as t };
