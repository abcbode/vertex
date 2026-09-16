import { createServerFn } from "@tanstack/react-start";
import { getSql, type Sql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { iso, num } from "@/lib/format";

export { getSql, authMiddleware };
export type { Sql };

export function n(v: unknown): number {
  return num(v);
}

export async function setting(sql: Sql, key: string, fallback = ""): Promise<string> {
  const rows = await sql<{ value: string }>`select value from settings where key = ${key}`;
  return rows[0]?.value ?? fallback;
}

export async function logActivity(
  sql: Sql,
  userId: string | null,
  role: string,
  action: string,
  detail = "",
) {
  await sql`insert into activity_logs (user_id, actor_role, action, detail) values (${userId}, ${role}, ${action}, ${detail})`;
}

export async function logError(message: string, stack = "") {
  try {
    const sql = await getSql();
    await sql`insert into error_logs (message, stack) values (${message}, ${stack.slice(0, 4000)})`;
  } catch {
    /* ignore */
  }
}

export type Profile = {
  userId: string;
  displayName: string;
  phone: string;
  email: string;
  role: string;
  status: string;
  totpEnabled: boolean;
  createdAt: string;
};

export type Wallet = {
  balance: number;
  totalDeposit: number;
  totalWithdraw: number;
  totalWin: number;
  totalLoss: number;
  totalVolume: number;
};

export async function getUserRow(sql: Sql, userId: string) {
  const rows = await sql<{ id: string; name: string; email: string; image: string | null }>`
    select id, name, email, image from "user" where id = ${userId}`;
  return rows[0] ?? null;
}

export async function ensureProfile(sql: Sql, userId: string): Promise<{
  profile: Profile;
  wallet: Wallet;
  isNew: boolean;
}> {
  const existing = await sql<{
    user_id: string;
    display_name: string;
    phone: string;
    role: string;
    status: string;
    totp_enabled: boolean;
    created_at: unknown;
  }>`select user_id, display_name, phone, role, status, totp_enabled, created_at from profiles where user_id = ${userId}`;

  const user = await getUserRow(sql, userId);
  const email = user?.email ?? "";
  const name = user?.name ?? email.split("@")[0] ?? "User";

  if (existing[0]) {
    const w = await sql<{
      balance: string;
      total_deposit: string;
      total_withdraw: string;
      total_win: string;
      total_loss: string;
      total_volume: string;
    }>`select balance, total_deposit, total_withdraw, total_win, total_loss, total_volume from wallets where user_id = ${userId}`;
    const wr = w[0];
    return {
      profile: {
        userId,
        displayName: existing[0].display_name || name,
        phone: existing[0].phone,
        email,
        role: existing[0].role,
        status: existing[0].status,
        totpEnabled: Boolean(existing[0].totp_enabled),
        createdAt: iso(existing[0].created_at),
      },
      wallet: {
        balance: n(wr?.balance),
        totalDeposit: n(wr?.total_deposit),
        totalWithdraw: n(wr?.total_withdraw),
        totalWin: n(wr?.total_win),
        totalLoss: n(wr?.total_loss),
        totalVolume: n(wr?.total_volume),
      },
      isNew: false,
    };
  }

  const role = "user";
  const bonus = n(await setting(sql, "welcome_bonus", "5000000"));

  await sql`insert into profiles (user_id, display_name, role) values (${userId}, ${name}, ${role})`;
  await sql`insert into wallets (user_id, balance) values (${userId}, ${bonus})`;
  if (bonus > 0) {
    await sql`insert into ledger (user_id, type, amount, balance_after, note) values (${userId}, 'bonus', ${bonus}, ${bonus}, 'Thuong chao mung')`;
  }
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
      createdAt: new Date().toISOString(),
    },
    wallet: {
      balance: bonus,
      totalDeposit: 0,
      totalWithdraw: 0,
      totalWin: 0,
      totalLoss: 0,
      totalVolume: 0,
    },
    isNew: true,
  };
}

export async function requireActiveUser(sql: Sql, userId: string) {
  const { profile, wallet } = await ensureProfile(sql, userId);
  if (profile.status === "locked") {
    throw new Error("Tài khoản đã bị khóa");
  }
  return { profile, wallet };
}

export async function requireAdmin(sql: Sql, userId: string) {
  const { profile } = await ensureProfile(sql, userId);
  if (profile.role !== "admin" && profile.role !== "superadmin") {
    throw new Error("Không có quyền quản trị");
  }
  if (profile.status === "locked") throw new Error("Tài khoản đã bị khóa");
  if (profile.totpEnabled) {
    const ok = await sql<{ verified_at: unknown }>`select verified_at from admin_2fa_ok where user_id = ${userId}`;
    if (!ok[0]) {
      const err = new Error("2FA_REQUIRED");
      throw err;
    }
    const t = new Date(iso(ok[0].verified_at)).getTime();
    if (Date.now() - t > 12 * 3600_000) {
      await sql`delete from admin_2fa_ok where user_id = ${userId}`;
      throw new Error("2FA_REQUIRED");
    }
  }
  return profile;
}

export async function applyLedger(
  sql: Sql,
  userId: string,
  type: string,
  amount: number,
  note: string,
  refType?: string,
  refId?: number,
) {
  const rows = await sql<{ balance: string }>`select balance from wallets where user_id = ${userId}`;
  const next = n(rows[0]?.balance) + amount;
  if (next < -0.001) throw new Error("Số dư không đủ");
  await sql`update wallets set balance = ${next}, updated_at = now() where user_id = ${userId}`;
  await sql`insert into ledger (user_id, type, amount, balance_after, ref_type, ref_id, note)
    values (${userId}, ${type}, ${amount}, ${next}, ${refType ?? null}, ${refId ?? null}, ${note})`;
  return next;
}

export const getBootstrap = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const { profile, wallet, isNew } = await ensureProfile(sql, context.userId);
    if (isNew) {
      await sql`insert into login_history (user_id, ip, user_agent) values (${context.userId}, ${""}, ${"first"})`;
    }
    const unread = await sql<{ c: number }>`
      select count(*)::int as c from notifications n
      where (n.audience = 'all' or n.target_user_id = ${context.userId}
        or (n.audience = 'group' and n.target_group = ${profile.status}))
      and not exists (select 1 from notification_reads r where r.notification_id = n.id and r.user_id = ${context.userId})`;
    const popup = await sql<{ id: number; title: string; body: string; image_url: string }>`
      select n.id, n.title, n.body, n.image_url from notifications n
      where n.type in ('popup','both')
        and (n.audience = 'all' or n.target_user_id = ${context.userId})
        and not exists (select 1 from notification_reads r where r.notification_id = n.id and r.user_id = ${context.userId})
      order by n.created_at desc limit 1`;
    return {
      profile,
      wallet,
      unread: unread[0]?.c ?? 0,
      popup: popup[0]
        ? { id: popup[0].id, title: popup[0].title, body: popup[0].body, imageUrl: popup[0].image_url }
        : null,
    };
  });
