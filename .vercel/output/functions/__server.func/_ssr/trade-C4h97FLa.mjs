import { r as createServerFn } from "./ssr.mjs";
import { D as _enum, F as object, P as number } from "../_libs/@better-auth/core+[...].mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { t as authMiddleware } from "./middleware-DfwaDDh6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/trade-C4h97FLa.js
var placeTrade = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	assetId: number(),
	direction: _enum(["up", "down"]),
	amount: number().positive(),
	expirySeconds: number().int().positive(),
	entryPrice: number().positive().optional()
})).handler(createSsrRpc("6517327efdd94394394bf3d68689e3fd965b00a59b33b742a7cb737353772dd8"));
var listMyTrades = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(createSsrRpc("46c074c43e53966763b8516baef63a6935d5ecc070f30739ac3964e9e74a2093"));
var listRunningTrades = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("f172d99641073444d4d6d0e3bd0cc1de3086f727f3ef26ac92e6eb71551fb845"));
//#endregion
export { listRunningTrades as n, placeTrade as r, listMyTrades as t };
