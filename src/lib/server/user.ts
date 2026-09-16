import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { hashPassword } from "better-auth/crypto";
import { randomBytes } from "node:crypto";
import {
  getSql,
  authMiddleware,
  n,
  requireActiveUser,
  ensureProfile,
  applyLedger,
  setting,
  logActivity,
} from "./core";
import { iso, vietQrUrl } from "@/lib/format";

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ displayName: z.string().min(1).max(80), phone: z.string().max(20) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    await sql`update profiles set display_name = ${data.displayName}, phone = ${data.phone}, updated_at = now() where user_id = ${context.userId}`;
    await sql`update "user" set name = ${data.displayName}, "updatedAt" = now() where id = ${context.userId}`;
    await logActivity(sql, context.userId, "user", "update_profile", data.displayName);
    return { ok: true };
  });

export const changeEmail = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ email: z.string().email() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireActiveUser(sql, context.userId);
    const taken = await sql<{ id: string }>`select id from "user" where email = ${data.email} and id <> ${context.userId}`;
    if (taken[0]) throw new Error("Email đã được sử dụng");
    await sql`update "user" set email = ${data.email}, "updatedAt" = now() where id = ${context.userId}`;
    await logActivity(sql, context.userId, "user", "change_email", data.email);
    return { ok: true };
  });

export const requestPasswordReset = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const user = await sql<{ id: string; email: string }>`select id, email from "user" where email = ${data.email}`;
    if (!user[0]) return { ok: true, token: null as string | null };
    const token = randomBytes(24).toString("hex");
    await sql`insert into password_resets (email, token, expires_at) values (${data.email}, ${token}, now() + interval '1 hour')`;
    return { ok: true, token };
  });

export const resetPasswordWithToken = createServerFn({ method: "POST" })
  .validator(z.object({ token: z.string(), password: z.string().min(8) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<{ email: string; used: boolean; expires_at: unknown }>`
      select email, used, expires_at from password_resets where token = ${data.token}`;
    const row = rows[0];
    if (!row || row.used) throw new Error("Mã không hợp lệ");
    if (new Date(iso(row.expires_at)).getTime() < Date.now()) throw new Error("Mã đã hết hạn");
    const user = await sql<{ id: string }>`select id from "user" where email = ${row.email}`;
    if (!user[0]) throw new Error("Không tìm thấy tài khoản");
    const hash = await hashPassword(data.password);
    await sql`update account set password = ${hash}, "updatedAt" = now() where "userId" = ${user[0].id} and "providerId" = 'credential'`;
    await sql`update password_resets set used = true where token = ${data.token}`;
    return { ok: true };
  });

export const getWallet = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const { profile, wallet } = await ensureProfile(sql, context.userId);
    return { profile, wallet };
  });

export const listLedger = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: { page?: number; from?: string; to?: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const page = Math.max(1, data.page ?? 1);
    const offset = (page - 1) * 20;
    const from = data.from || null;
    const to = data.to || null;
    const rows = await sql<{
      id: number;
      type: string;
      amount: string;
      balance_after: string;
      note: string | null;
      created_at: unknown;
    }>`select id, type, amount, balance_after, note, created_at from ledger
       where user_id = ${context.userId}
         and (${from}::date is null or created_at::date >= ${from}::date)
         and (${to}::date is null or created_at::date <= ${to}::date)
       order by created_at desc limit 20 offset ${offset}`;
    const total = await sql<{ c: number }>`select count(*)::int as c from ledger where user_id = ${context.userId}
         and (${from}::date is null or created_at::date >= ${from}::date)
         and (${to}::date is null or created_at::date <= ${to}::date)`;
    return {
      page,
      total: total[0]?.c ?? 0,
      rows: rows.map((r) => ({
        id: r.id,
        type: r.type,
        amount: n(r.amount),
        balanceAfter: n(r.balance_after),
        note: r.note ?? "",
        createdAt: iso(r.created_at),
      })),
    };
  });

export const getDepositInfo = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const banks = await sql<{
      id: number;
      bank_name: string;
      bank_code: string;
      account_number: string;
      account_name: string;
      branch: string;
      is_default: boolean;
    }>`select id, bank_name, bank_code, account_number, account_name, branch, is_default from bank_accounts where is_active = true order by is_default desc, id`;
    const qrs = await sql<{ id: number; bank_account_id: number | null; label: string; image_url: string }>`
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
        isDefault: b.is_default,
      })),
      qrs: qrs.map((q) => ({
        id: q.id,
        bankAccountId: q.bank_account_id,
        label: q.label,
        imageUrl: q.image_url,
      })),
      prefix,
      min,
      userCode: context.userId.slice(-6).toUpperCase(),
    };
  });

export const createDeposit = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ amount: z.number().positive(), bankAccountId: z.number() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireActiveUser(sql, context.userId);
    const min = n(await setting(sql, "min_deposit", "50000"));
    if (data.amount < min) throw new Error(`Nạp tối thiểu ${min.toLocaleString("vi-VN")} đ`);
    const bank = await sql<{ id: number }>`select id from bank_accounts where id = ${data.bankAccountId} and is_active = true`;
    if (!bank[0]) throw new Error("Tài khoản ngân hàng không hợp lệ");
    const prefix = await setting(sql, "transfer_prefix", "VERTEX");
    const content = `${prefix}${context.userId.slice(-6).toUpperCase()}`;
    const ins = await sql<{ id: number }>`
      insert into deposits (user_id, amount, bank_account_id, transfer_content)
      values (${context.userId}, ${data.amount}, ${data.bankAccountId}, ${content})
      returning id`;
    await logActivity(sql, context.userId, "user", "create_deposit", String(data.amount));
    return { id: ins[0].id, content };
  });

export const listDeposits = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: { page?: number }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const page = Math.max(1, data.page ?? 1);
    const rows = await sql<{
      id: number;
      amount: string;
      transfer_content: string;
      status: string;
      admin_note: string;
      created_at: unknown;
    }>`select id, amount, transfer_content, status, admin_note, created_at from deposits
       where user_id = ${context.userId} order by created_at desc limit 20 offset ${(page - 1) * 20}`;
    const total = await sql<{ c: number }>`select count(*)::int as c from deposits where user_id = ${context.userId}`;
    return {
      page,
      total: total[0]?.c ?? 0,
      rows: rows.map((r) => ({
        id: r.id,
        amount: n(r.amount),
        content: r.transfer_content,
        status: r.status,
        note: r.admin_note,
        createdAt: iso(r.created_at),
      })),
    };
  });

export const listUserBanks = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      bank_name: string;
      bank_code: string;
      account_number: string;
      account_name: string;
    }>`select id, bank_name, bank_code, account_number, account_name from user_banks where user_id = ${context.userId} order by id desc`;
    return rows.map((r) => ({
      id: r.id,
      bankName: r.bank_name,
      bankCode: r.bank_code,
      accountNumber: r.account_number,
      accountName: r.account_name,
    }));
  });

export const addUserBank = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      bankName: z.string().min(2),
      bankCode: z.string(),
      accountNumber: z.string().min(4),
      accountName: z.string().min(2),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireActiveUser(sql, context.userId);
    await sql`insert into user_banks (user_id, bank_name, bank_code, account_number, account_name)
      values (${context.userId}, ${data.bankName}, ${data.bankCode}, ${data.accountNumber}, ${data.accountName})`;
    return { ok: true };
  });

export const createWithdraw = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ amount: z.number().positive(), bankId: z.number() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const { wallet } = await requireActiveUser(sql, context.userId);
    const min = n(await setting(sql, "min_withdraw", "100000"));
    if (data.amount < min) throw new Error(`Rút tối thiểu ${min.toLocaleString("vi-VN")} đ`);
    if (wallet.balance < data.amount) throw new Error("Số dư không đủ");
    const bank = await sql<{
      bank_name: string;
      account_number: string;
      account_name: string;
    }>`select bank_name, account_number, account_name from user_banks where id = ${data.bankId} and user_id = ${context.userId}`;
    if (!bank[0]) throw new Error("Chọn tài khoản ngân hàng");
    const ins = await sql<{ id: number }>`
      insert into withdrawals (user_id, amount, bank_name, account_number, account_name)
      values (${context.userId}, ${data.amount}, ${bank[0].bank_name}, ${bank[0].account_number}, ${bank[0].account_name})
      returning id`;
    await applyLedger(sql, context.userId, "withdraw", -data.amount, "Rut tien", "withdraw", ins[0].id);
    await logActivity(sql, context.userId, "user", "create_withdraw", String(data.amount));
    return { id: ins[0].id };
  });

export const listWithdrawals = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: { page?: number }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const page = Math.max(1, data.page ?? 1);
    const rows = await sql<{
      id: number;
      amount: string;
      bank_name: string;
      account_number: string;
      account_name: string;
      status: string;
      admin_note: string;
      created_at: unknown;
    }>`select id, amount, bank_name, account_number, account_name, status, admin_note, created_at from withdrawals
       where user_id = ${context.userId} order by created_at desc limit 20 offset ${(page - 1) * 20}`;
    const total = await sql<{ c: number }>`select count(*)::int as c from withdrawals where user_id = ${context.userId}`;
    return {
      page,
      total: total[0]?.c ?? 0,
      rows: rows.map((r) => ({
        id: r.id,
        amount: n(r.amount),
        bankName: r.bank_name,
        accountNumber: r.account_number,
        accountName: r.account_name,
        status: r.status,
        note: r.admin_note,
        createdAt: iso(r.created_at),
      })),
    };
  });

export const listLoginHistory = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ id: number; ip: string; user_agent: string; created_at: unknown }>`
      select id, ip, user_agent, created_at from login_history where user_id = ${context.userId} order by created_at desc limit 20`;
    return rows.map((r) => ({
      id: r.id,
      ip: r.ip || "—",
      userAgent: r.user_agent || "—",
      createdAt: iso(r.created_at),
    }));
  });

export const recordLogin = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const last = await sql<{ created_at: unknown }>`select created_at from login_history where user_id = ${context.userId} order by created_at desc limit 1`;
    const recent = last[0] && Date.now() - new Date(iso(last[0].created_at)).getTime() < 30 * 60_000;
    if (!recent) {
      await sql`insert into login_history (user_id, ip, user_agent) values (${context.userId}, ${""}, ${"web"})`;
    }
    return { ok: true };
  });

export function depositQrSrc(opts: {
  bankCode: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  content: string;
  custom?: string;
}) {
  if (opts.custom) return opts.custom;
  if (!opts.bankCode) return "";
  return vietQrUrl({
    bankCode: opts.bankCode,
    accountNumber: opts.accountNumber,
    accountName: opts.accountName,
    amount: opts.amount,
    addInfo: opts.content,
  });
}
