import { r as createServerFn } from "./ssr.mjs";
import { A as boolean, D as _enum, F as object, L as record, P as number, R as string } from "../_libs/@better-auth/core+[...].mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { t as authMiddleware } from "./middleware-DfwaDDh6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-Bp8V99lv.js
var prepareAdminLogin = createServerFn({ method: "GET" }).handler(createSsrRpc("cc529a2d3608d15080fef9017ac7a2e81afe63b28170899048f2b24cb7830e22"));
var adminPing = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("8801c47e08d3a38966f12b2bdc24e1bd6aea79179abc2d000523a830eacb5c74"));
var verifyAdmin2fa = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ code: string() })).handler(createSsrRpc("27c52b357740d9581847e114cdca19ce9891feaf6875a8cd7e0c9af8d9ceb8bb"));
var setupAdmin2fa = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("9f17fa6b180718e24f3b9d1f07567e0697ea2b2b514e61cd968aa2ed1d22dad3"));
var confirmAdmin2fa = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ code: string() })).handler(createSsrRpc("bd33ba3e8a3c9b05f3873e1edbbf67f9542cfa2071af349a37a5062e45d130d2"));
var disableAdmin2fa = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ code: string() })).handler(createSsrRpc("9bb043575839e6e51b55dbc27927287de12dec7e1546559737f7cd0fde7d20d9"));
var getDashboard = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(createSsrRpc("a4d1e1a0fbd35f1887b311ded858b2b2fa1a387726501a02ca3b8473cc2c267a"));
var listUsers = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(createSsrRpc("8ff428842bb49781522d3045308fc4b9413c4565e4912c7391c8e5ad80c3b07b"));
var getUserAdmin = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(createSsrRpc("a59c9da0ab03659722ae81b20ba7ff223815ab798bbd86f845650e2eecfd8c7d"));
var setUserStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	userId: string(),
	status: _enum(["active", "locked"])
})).handler(createSsrRpc("56990600344cbf743830ade475286d52b2d8720f63fbc4e55b17c2a6b289a76c"));
var setUserRole = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	userId: string(),
	role: _enum(["user", "admin"])
})).handler(createSsrRpc("ac3f811a02d228af5c22de1cb1fe741feaa6d4ac380686214453278a57b4d919"));
var resetUserPassword = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ userId: string() })).handler(createSsrRpc("dcbe79a1566b9bf039eea75f955c6727d3fdc8e144f84bf2b780aec4c1d6f02b"));
var listAdminDeposits = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(createSsrRpc("23bdc7359784c4e4743047c4bc44b5604a24cab6c046f04f67fc12943e7ccc08"));
var reviewDeposit = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: number(),
	action: _enum(["approve", "reject"]),
	note: string().optional()
})).handler(createSsrRpc("de88e7ba3adabab54f9a952e2f50dfe92c40c443bdaa947d59b0c5fc8606aea4"));
var listAdminWithdrawals = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(createSsrRpc("c9f96fdd86815518d2fac5c0666f870992d0412f33b29c9ad1c019e13ef65a26"));
var reviewWithdraw = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: number(),
	action: _enum([
		"approve",
		"reject",
		"paid"
	]),
	note: string().optional()
})).handler(createSsrRpc("5698905ba84bb9adf99a3c60d664e4309c13b1ee4c52406dbde3a14a35508df8"));
var listBanksAdmin = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("ad2c745fdaf5a96052f8371ab4ee39760e359b551aa7158f9fca3fff11c20630"));
var saveBank = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: number().optional(),
	bankName: string(),
	bankCode: string(),
	accountNumber: string(),
	accountName: string(),
	branch: string()
})).handler(createSsrRpc("f9e4e9f3b86a1ddfe5c89c0199969d488a6474b8875e666e904048f5574a284a"));
var toggleBank = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: number(),
	field: _enum([
		"active",
		"default",
		"delete"
	])
})).handler(createSsrRpc("599e24450415aac4140e08db14ee0f5aaca59e4b8b2e425c45f3cd9e294c6717"));
var listQrAdmin = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("1ded30c7226a839044add67c90cb9d1e260545561c852b646dd80e201f341b38"));
var saveQr = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: number().optional(),
	bankAccountId: number().nullable(),
	label: string(),
	imageUrl: string()
})).handler(createSsrRpc("5cd9983f36239101018c6e857f7db6a6aa29c2ec43962a5b71f04529e3869cd5"));
var toggleQr = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: number(),
	del: boolean().optional()
})).handler(createSsrRpc("e2abe9247140c0ee33d75c339e025f32c45eaee303cce45dc7447eaa05212d0f"));
var listAssetsAdmin = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("7965c6be1cce514e3fc3a77edd4632a7d64aed5f2e4d796a82d65fd06d3c9de5"));
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
})).handler(createSsrRpc("028fea6d263a55e815387bf4ca9d0748c527e54ba23f58928d5da27828cd3479"));
var toggleAsset = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: number(),
	field: _enum([
		"active",
		"paused",
		"delete"
	])
})).handler(createSsrRpc("93f9e17a216c0c1128d5986ae0b1ab256f5518c61568c1c6f294ef22553cc79e"));
var toggleTf = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	kind: _enum(["tf", "exp"]),
	id: number(),
	seconds: number().optional(),
	label: string().optional()
})).handler(createSsrRpc("43d44d2ffbd134306d5b291f2a47a83cca0e1fdae08994874e382b61c303536e"));
var listTradesAdmin = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(createSsrRpc("81d605ea100d712c7f73db37c530bf718a9680a5438da1ac8c03d6ade3b8494b"));
var getSettings = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("f8a0b8eca9795930374684cec3e0f28d307d4e92df95beb06334ed0304cdb8eb"));
var saveSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(record(string(), string())).handler(createSsrRpc("c2e088d673ccff2c8e6325f78aa413af66c01db491d13cf76f532e67bb73b352"));
var listActivity = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(createSsrRpc("2a7d968c513ce071a5d788fd8dbbb236c53b8ec57d31fcc2b8e98f65f53ba88f"));
var exportBackup = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("d7c6a69f39ab53100e0a25f156adf3ad6be8f400a2a706eb6728844917a58c60"));
var listErrors = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("ed2f3e8fe534ff51303bae29c08ec52e6591d12054ae31a8576dff75175cea34"));
//#endregion
export { toggleQr as A, saveQr as C, setupAdmin2fa as D, setUserStatus as E, verifyAdmin2fa as M, toggleAsset as O, saveBank as S, setUserRole as T, prepareAdminLogin as _, getDashboard as a, reviewWithdraw as b, listActivity as c, listAssetsAdmin as d, listBanksAdmin as f, listUsers as g, listTradesAdmin as h, exportBackup as i, toggleTf as j, toggleBank as k, listAdminDeposits as l, listQrAdmin as m, confirmAdmin2fa as n, getSettings as o, listErrors as p, disableAdmin2fa as r, getUserAdmin as s, adminPing as t, listAdminWithdrawals as u, resetUserPassword as v, saveSettings as w, saveAsset as x, reviewDeposit as y };
