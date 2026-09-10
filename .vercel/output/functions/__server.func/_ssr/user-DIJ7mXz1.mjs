import { r as createServerFn } from "./ssr.mjs";
import { F as object, P as number, R as string } from "../_libs/@better-auth/core+[...].mjs";
import { t as authMiddleware } from "./middleware-DfwaDDh6.mjs";
import { a as iso } from "./format-Bc8Vy2YH.mjs";
import { a as n, c as setting, i as logActivity, n as ensureProfile, o as requireActiveUser, t as applyLedger } from "./core-hltlGHwq.mjs";
import { t as hashPassword$1 } from "./password-VlpK0Xix.mjs";
import { r as getSql } from "./db-4Pp7elo5.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { randomBytes } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/user-DIJ7mXz1.js
var updateProfile_createServerFn_handler = createServerRpc({
	id: "70f7e0d6d1208b4cbf51a55c650316c64674d3c46651ffe197bc28dd2daa0d6d",
	name: "updateProfile",
	filename: "src/lib/server/user.ts"
}, (opts) => updateProfile.__executeServer(opts));
var updateProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	displayName: string().min(1).max(80),
	phone: string().max(20)
})).handler(updateProfile_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	await sql`update profiles set display_name = ${data.displayName}, phone = ${data.phone}, updated_at = now() where user_id = ${context.userId}`;
	await sql`update "user" set name = ${data.displayName}, "updatedAt" = now() where id = ${context.userId}`;
	await logActivity(sql, context.userId, "user", "update_profile", data.displayName);
	return { ok: true };
});
var changeEmail_createServerFn_handler = createServerRpc({
	id: "cf3b9d707a851f9167b5d52cfa494825de6c889c02e78de9ecbc639fb2bcd4bb",
	name: "changeEmail",
	filename: "src/lib/server/user.ts"
}, (opts) => changeEmail.__executeServer(opts));
var changeEmail = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ email: string().email() })).handler(changeEmail_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireActiveUser(sql, context.userId);
	if ((await sql`select id from "user" where email = ${data.email} and id <> ${context.userId}`)[0]) throw new Error("Email đã được sử dụng");
	await sql`update "user" set email = ${data.email}, "updatedAt" = now() where id = ${context.userId}`;
	await logActivity(sql, context.userId, "user", "change_email", data.email);
	return { ok: true };
});
var requestPasswordReset_createServerFn_handler = createServerRpc({
	id: "711340b9dd018cae1f6f4d42e888880dae9eee480163bae1504c47ddc10fde21",
	name: "requestPasswordReset",
	filename: "src/lib/server/user.ts"
}, (opts) => requestPasswordReset.__executeServer(opts));
var requestPasswordReset = createServerFn({ method: "POST" }).validator(object({ email: string().email() })).handler(requestPasswordReset_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	if (!(await sql`select id, email from "user" where email = ${data.email}`)[0]) return {
		ok: true,
		token: null
	};
	const token = randomBytes(24).toString("hex");
	await sql`insert into password_resets (email, token, expires_at) values (${data.email}, ${token}, now() + interval '1 hour')`;
	return {
		ok: true,
		token
	};
});
var resetPasswordWithToken_createServerFn_handler = createServerRpc({
	id: "6fda9200dffd1c2086246026bdfb94e6508e41d36a0bbf5afb49e4a64851a7ec",
	name: "resetPasswordWithToken",
	filename: "src/lib/server/user.ts"
}, (opts) => resetPasswordWithToken.__executeServer(opts));
var resetPasswordWithToken = createServerFn({ method: "POST" }).validator(object({
	token: string(),
	password: string().min(8)
})).handler(resetPasswordWithToken_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const row = (await sql`
      select email, used, expires_at from password_resets where token = ${data.token}`)[0];
	if (!row || row.used) throw new Error("Mã không hợp lệ");
	if (new Date(iso(row.expires_at)).getTime() < Date.now()) throw new Error("Mã đã hết hạn");
	const user = await sql`select id from "user" where email = ${row.email}`;
	if (!user[0]) throw new Error("Không tìm thấy tài khoản");
	await sql`update account set password = ${await hashPassword$1(data.password)}, "updatedAt" = now() where "userId" = ${user[0].id} and "providerId" = 'credential'`;
	await sql`update password_resets set used = true where token = ${data.token}`;
	return { ok: true };
});
var getWallet_createServerFn_handler = createServerRpc({
	id: "edb12190f1a6ccee3517d3ce43730122c07a482c71a2571a61543912983ee794",
	name: "getWallet",
	filename: "src/lib/server/user.ts"
}, (opts) => getWallet.__executeServer(opts));
var getWallet = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getWallet_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const { profile, wallet } = await ensureProfile(sql, context.userId);
	return {
		profile,
		wallet
	};
});
var listLedger_createServerFn_handler = createServerRpc({
	id: "05fd4094ca9356ffd3b835748c7d67e631da74958a597606af63100284b0509f",
	name: "listLedger",
	filename: "src/lib/server/user.ts"
}, (opts) => listLedger.__executeServer(opts));
var listLedger = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(listLedger_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const page = Math.max(1, data.page ?? 1);
	const offset = (page - 1) * 20;
	const from = data.from || null;
	const to = data.to || null;
	const rows = await sql`select id, type, amount, balance_after, note, created_at from ledger
       where user_id = ${context.userId}
         and (${from}::date is null or created_at::date >= ${from}::date)
         and (${to}::date is null or created_at::date <= ${to}::date)
       order by created_at desc limit 20 offset ${offset}`;
	return {
		page,
		total: (await sql`select count(*)::int as c from ledger where user_id = ${context.userId}
         and (${from}::date is null or created_at::date >= ${from}::date)
         and (${to}::date is null or created_at::date <= ${to}::date)`)[0]?.c ?? 0,
		rows: rows.map((r) => ({
			id: r.id,
			type: r.type,
			amount: n(r.amount),
			balanceAfter: n(r.balance_after),
			note: r.note ?? "",
			createdAt: iso(r.created_at)
		}))
	};
});
var getDepositInfo_createServerFn_handler = createServerRpc({
	id: "672cfe23e66f1e1bae5c4a81f8b243e8172efb5487d075145f5d0c4375ddfdcd",
	name: "getDepositInfo",
	filename: "src/lib/server/user.ts"
}, (opts) => getDepositInfo.__executeServer(opts));
var getDepositInfo = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getDepositInfo_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	const banks = await sql`select id, bank_name, bank_code, account_number, account_name, branch, is_default from bank_accounts where is_active = true order by is_default desc, id`;
	const qrs = await sql`
      select id, bank_account_id, label, image_url from qr_codes where is_active = true`;
	const prefix = await setting(sql, "transfer_prefix", "VERTEX");
	const min = n(await setting(sql, "min_deposit", "50000"));
	return {
		banks: banks.map((b) => ({
			id: b.id,
			bankName: b.bank_name,
			bankCode: b.bank_code,
			accountNumber: b.account_number,
			accountName: b.account_name,
			branch: b.branch,
			isDefault: b.is_default
		})),
		qrs: qrs.map((q) => ({
			id: q.id,
			bankAccountId: q.bank_account_id,
			label: q.label,
			imageUrl: q.image_url
		})),
		prefix,
		min,
		userCode: context.userId.slice(-6).toUpperCase()
	};
});
var createDeposit_createServerFn_handler = createServerRpc({
	id: "764b088927a30d41c92e169c87f3f63bf2de886d0626de636a866efd9a50e034",
	name: "createDeposit",
	filename: "src/lib/server/user.ts"
}, (opts) => createDeposit.__executeServer(opts));
var createDeposit = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	amount: number().positive(),
	bankAccountId: number()
})).handler(createDeposit_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireActiveUser(sql, context.userId);
	const min = n(await setting(sql, "min_deposit", "50000"));
	if (data.amount < min) throw new Error(`Nạp tối thiểu ${min.toLocaleString("vi-VN")} đ`);
	if (!(await sql`select id from bank_accounts where id = ${data.bankAccountId} and is_active = true`)[0]) throw new Error("Tài khoản ngân hàng không hợp lệ");
	const content = `${await setting(sql, "transfer_prefix", "VERTEX")}${context.userId.slice(-6).toUpperCase()}`;
	const ins = await sql`
      insert into deposits (user_id, amount, bank_account_id, transfer_content)
      values (${context.userId}, ${data.amount}, ${data.bankAccountId}, ${content})
      returning id`;
	await logActivity(sql, context.userId, "user", "create_deposit", String(data.amount));
	return {
		id: ins[0].id,
		content
	};
});
var listDeposits_createServerFn_handler = createServerRpc({
	id: "653bc5627ddb96ff0f2a34a4271619b8105a4f84edaf89344cb41f36caf7c996",
	name: "listDeposits",
	filename: "src/lib/server/user.ts"
}, (opts) => listDeposits.__executeServer(opts));
var listDeposits = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(listDeposits_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const page = Math.max(1, data.page ?? 1);
	const rows = await sql`select id, amount, transfer_content, status, admin_note, created_at from deposits
       where user_id = ${context.userId} order by created_at desc limit 20 offset ${(page - 1) * 20}`;
	return {
		page,
		total: (await sql`select count(*)::int as c from deposits where user_id = ${context.userId}`)[0]?.c ?? 0,
		rows: rows.map((r) => ({
			id: r.id,
			amount: n(r.amount),
			content: r.transfer_content,
			status: r.status,
			note: r.admin_note,
			createdAt: iso(r.created_at)
		}))
	};
});
var listUserBanks_createServerFn_handler = createServerRpc({
	id: "987b29a1c49742901ec06dd64618042b82c2e811c6b1468df47a01cd1a7d99d2",
	name: "listUserBanks",
	filename: "src/lib/server/user.ts"
}, (opts) => listUserBanks.__executeServer(opts));
var listUserBanks = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listUserBanks_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`select id, bank_name, bank_code, account_number, account_name from user_banks where user_id = ${context.userId} order by id desc`).map((r) => ({
		id: r.id,
		bankName: r.bank_name,
		bankCode: r.bank_code,
		accountNumber: r.account_number,
		accountName: r.account_name
	}));
});
var addUserBank_createServerFn_handler = createServerRpc({
	id: "aa07a42648193aab4e058a2f5189012ba8b11015d7a9347d20c7008f3c70e63f",
	name: "addUserBank",
	filename: "src/lib/server/user.ts"
}, (opts) => addUserBank.__executeServer(opts));
var addUserBank = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	bankName: string().min(2),
	bankCode: string(),
	accountNumber: string().min(4),
	accountName: string().min(2)
})).handler(addUserBank_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await requireActiveUser(sql, context.userId);
	await sql`insert into user_banks (user_id, bank_name, bank_code, account_number, account_name)
      values (${context.userId}, ${data.bankName}, ${data.bankCode}, ${data.accountNumber}, ${data.accountName})`;
	return { ok: true };
});
var createWithdraw_createServerFn_handler = createServerRpc({
	id: "1e2acb94f84caabfebd291b41c06fa6593c9f55f4662c587a50a94166d7289b8",
	name: "createWithdraw",
	filename: "src/lib/server/user.ts"
}, (opts) => createWithdraw.__executeServer(opts));
var createWithdraw = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	amount: number().positive(),
	bankId: number()
})).handler(createWithdraw_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const { wallet } = await requireActiveUser(sql, context.userId);
	const min = n(await setting(sql, "min_withdraw", "100000"));
	if (data.amount < min) throw new Error(`Rút tối thiểu ${min.toLocaleString("vi-VN")} đ`);
	if (wallet.balance < data.amount) throw new Error("Số dư không đủ");
	const bank = await sql`select bank_name, account_number, account_name from user_banks where id = ${data.bankId} and user_id = ${context.userId}`;
	if (!bank[0]) throw new Error("Chọn tài khoản ngân hàng");
	const ins = await sql`
      insert into withdrawals (user_id, amount, bank_name, account_number, account_name)
      values (${context.userId}, ${data.amount}, ${bank[0].bank_name}, ${bank[0].account_number}, ${bank[0].account_name})
      returning id`;
	await applyLedger(sql, context.userId, "withdraw", -data.amount, "Rut tien", "withdraw", ins[0].id);
	await logActivity(sql, context.userId, "user", "create_withdraw", String(data.amount));
	return { id: ins[0].id };
});
var listWithdrawals_createServerFn_handler = createServerRpc({
	id: "8fad021a7f385c3078749a555bf4bf1bd79d408ee73b78ba3de2544afbdcb856",
	name: "listWithdrawals",
	filename: "src/lib/server/user.ts"
}, (opts) => listWithdrawals.__executeServer(opts));
var listWithdrawals = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(listWithdrawals_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const page = Math.max(1, data.page ?? 1);
	const rows = await sql`select id, amount, bank_name, account_number, account_name, status, admin_note, created_at from withdrawals
       where user_id = ${context.userId} order by created_at desc limit 20 offset ${(page - 1) * 20}`;
	return {
		page,
		total: (await sql`select count(*)::int as c from withdrawals where user_id = ${context.userId}`)[0]?.c ?? 0,
		rows: rows.map((r) => ({
			id: r.id,
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
var listLoginHistory_createServerFn_handler = createServerRpc({
	id: "7d0299dda3e65912eddcf82e93cd9df903c05607705dd3a79eed8d88fbf90a58",
	name: "listLoginHistory",
	filename: "src/lib/server/user.ts"
}, (opts) => listLoginHistory.__executeServer(opts));
var listLoginHistory = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listLoginHistory_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`
      select id, ip, user_agent, created_at from login_history where user_id = ${context.userId} order by created_at desc limit 20`).map((r) => ({
		id: r.id,
		ip: r.ip || "—",
		userAgent: r.user_agent || "—",
		createdAt: iso(r.created_at)
	}));
});
var recordLogin_createServerFn_handler = createServerRpc({
	id: "78d0801743bbdbf2b9eda25e385c5de424244043eb8c23fa326e8736ed8ec99b",
	name: "recordLogin",
	filename: "src/lib/server/user.ts"
}, (opts) => recordLogin.__executeServer(opts));
var recordLogin = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(recordLogin_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	const last = await sql`select created_at from login_history where user_id = ${context.userId} order by created_at desc limit 1`;
	if (!(last[0] && Date.now() - new Date(iso(last[0].created_at)).getTime() < 18e5)) await sql`insert into login_history (user_id, ip, user_agent) values (${context.userId}, ${""}, ${"web"})`;
	return { ok: true };
});
//#endregion
export { addUserBank_createServerFn_handler, changeEmail_createServerFn_handler, createDeposit_createServerFn_handler, createWithdraw_createServerFn_handler, getDepositInfo_createServerFn_handler, getWallet_createServerFn_handler, listDeposits_createServerFn_handler, listLedger_createServerFn_handler, listLoginHistory_createServerFn_handler, listUserBanks_createServerFn_handler, listWithdrawals_createServerFn_handler, recordLogin_createServerFn_handler, requestPasswordReset_createServerFn_handler, resetPasswordWithToken_createServerFn_handler, updateProfile_createServerFn_handler };
