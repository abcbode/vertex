import { r as createServerFn } from "./ssr.mjs";
import { F as object, P as number, R as string } from "../_libs/@better-auth/core+[...].mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { t as authMiddleware } from "./middleware-DfwaDDh6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/user-EfFR6VyT.js
var updateProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	displayName: string().min(1).max(80),
	phone: string().max(20)
})).handler(createSsrRpc("70f7e0d6d1208b4cbf51a55c650316c64674d3c46651ffe197bc28dd2daa0d6d"));
var changeEmail = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ email: string().email() })).handler(createSsrRpc("cf3b9d707a851f9167b5d52cfa494825de6c889c02e78de9ecbc639fb2bcd4bb"));
var requestPasswordReset = createServerFn({ method: "POST" }).validator(object({ email: string().email() })).handler(createSsrRpc("711340b9dd018cae1f6f4d42e888880dae9eee480163bae1504c47ddc10fde21"));
var resetPasswordWithToken = createServerFn({ method: "POST" }).validator(object({
	token: string(),
	password: string().min(8)
})).handler(createSsrRpc("6fda9200dffd1c2086246026bdfb94e6508e41d36a0bbf5afb49e4a64851a7ec"));
var getWallet = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("edb12190f1a6ccee3517d3ce43730122c07a482c71a2571a61543912983ee794"));
var listLedger = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(createSsrRpc("05fd4094ca9356ffd3b835748c7d67e631da74958a597606af63100284b0509f"));
var getDepositInfo = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("672cfe23e66f1e1bae5c4a81f8b243e8172efb5487d075145f5d0c4375ddfdcd"));
var createDeposit = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	amount: number().positive(),
	bankAccountId: number()
})).handler(createSsrRpc("764b088927a30d41c92e169c87f3f63bf2de886d0626de636a866efd9a50e034"));
var listDeposits = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(createSsrRpc("653bc5627ddb96ff0f2a34a4271619b8105a4f84edaf89344cb41f36caf7c996"));
var listUserBanks = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("987b29a1c49742901ec06dd64618042b82c2e811c6b1468df47a01cd1a7d99d2"));
var addUserBank = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	bankName: string().min(2),
	bankCode: string(),
	accountNumber: string().min(4),
	accountName: string().min(2)
})).handler(createSsrRpc("aa07a42648193aab4e058a2f5189012ba8b11015d7a9347d20c7008f3c70e63f"));
var createWithdraw = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	amount: number().positive(),
	bankId: number()
})).handler(createSsrRpc("1e2acb94f84caabfebd291b41c06fa6593c9f55f4662c587a50a94166d7289b8"));
var listWithdrawals = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(createSsrRpc("8fad021a7f385c3078749a555bf4bf1bd79d408ee73b78ba3de2544afbdcb856"));
var listLoginHistory = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("7d0299dda3e65912eddcf82e93cd9df903c05607705dd3a79eed8d88fbf90a58"));
var recordLogin = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("78d0801743bbdbf2b9eda25e385c5de424244043eb8c23fa326e8736ed8ec99b"));
//#endregion
export { getDepositInfo as a, listLedger as c, listWithdrawals as d, recordLogin as f, updateProfile as h, createWithdraw as i, listLoginHistory as l, resetPasswordWithToken as m, changeEmail as n, getWallet as o, requestPasswordReset as p, createDeposit as r, listDeposits as s, addUserBank as t, listUserBanks as u };
