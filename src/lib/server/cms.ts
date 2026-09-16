import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql, authMiddleware, requireAdmin, ensureProfile, logActivity } from "./core";
import { iso } from "@/lib/format";

export const listSupportPublic = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<{
    id: number;
    name: string;
    avatar_url: string;
    bio: string;
    telegram: string;
    zalo: string;
    messenger: string;
    phone: string;
  }>`select id, name, avatar_url, bio, telegram, zalo, messenger, phone from support_agents where is_active = true order by sort_order, id`;
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    avatarUrl: r.avatar_url,
    bio: r.bio,
    telegram: r.telegram,
    zalo: r.zalo,
    messenger: r.messenger,
    phone: r.phone,
  }));
});

export const listSupportAdmin = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const rows = await sql<{
      id: number;
      name: string;
      avatar_url: string;
      bio: string;
      telegram: string;
      zalo: string;
      messenger: string;
      phone: string;
      is_active: boolean;
      sort_order: number;
    }>`select id, name, avatar_url, bio, telegram, zalo, messenger, phone, is_active, sort_order from support_agents order by sort_order, id`;
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      avatarUrl: r.avatar_url,
      bio: r.bio,
      telegram: r.telegram,
      zalo: r.zalo,
      messenger: r.messenger,
      phone: r.phone,
      isActive: r.is_active,
      sortOrder: r.sort_order,
    }));
  });

export const saveSupport = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.number().optional(),
      name: z.string(),
      avatarUrl: z.string(),
      bio: z.string(),
      telegram: z.string(),
      zalo: z.string(),
      messenger: z.string(),
      phone: z.string(),
      sortOrder: z.number(),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    if (data.id) {
      await sql`update support_agents set name=${data.name}, avatar_url=${data.avatarUrl}, bio=${data.bio}, telegram=${data.telegram}, zalo=${data.zalo}, messenger=${data.messenger}, phone=${data.phone}, sort_order=${data.sortOrder} where id=${data.id}`;
    } else {
      await sql`insert into support_agents (name, avatar_url, bio, telegram, zalo, messenger, phone, sort_order)
        values (${data.name}, ${data.avatarUrl}, ${data.bio}, ${data.telegram}, ${data.zalo}, ${data.messenger}, ${data.phone}, ${data.sortOrder})`;
    }
    return { ok: true };
  });

export const toggleSupport = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.number(), del: z.boolean().optional() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    if (data.del) await sql`delete from support_agents where id = ${data.id}`;
    else await sql`update support_agents set is_active = not is_active where id = ${data.id}`;
    return { ok: true };
  });

export const listNotifications = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const { profile } = await ensureProfile(sql, context.userId);
    const rows = await sql<{
      id: number;
      title: string;
      body: string;
      image_url: string;
      type: string;
      created_at: unknown;
      read: boolean;
    }>`select n.id, n.title, n.body, n.image_url, n.type, n.created_at,
              exists(select 1 from notification_reads r where r.notification_id = n.id and r.user_id = ${context.userId}) as read
       from notifications n
       where n.audience = 'all'
          or n.target_user_id = ${context.userId}
          or (n.audience = 'group' and n.target_group = ${profile.status})
       order by n.created_at desc limit 50`;
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      imageUrl: r.image_url,
      type: r.type,
      createdAt: iso(r.created_at),
      read: Boolean(r.read),
    }));
  });

export const markRead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.number() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`insert into notification_reads (notification_id, user_id) values (${data.id}, ${context.userId}) on conflict do nothing`;
    return { ok: true };
  });

export const listNotificationsAdmin = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    const rows = await sql<{
      id: number;
      title: string;
      body: string;
      image_url: string;
      type: string;
      audience: string;
      target_user_id: string | null;
      target_group: string | null;
      created_at: unknown;
      reads: number;
    }>`select n.id, n.title, n.body, n.image_url, n.type, n.audience, n.target_user_id, n.target_group, n.created_at,
              (select count(*)::int from notification_reads r where r.notification_id = n.id) as reads
       from notifications n order by n.created_at desc limit 80`;
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      imageUrl: r.image_url,
      type: r.type,
      audience: r.audience,
      targetUserId: r.target_user_id,
      targetGroup: r.target_group,
      createdAt: iso(r.created_at),
      reads: r.reads,
    }));
  });

export const saveNotification = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.number().optional(),
      title: z.string(),
      body: z.string(),
      imageUrl: z.string(),
      type: z.enum(["in_app", "popup", "both"]),
      audience: z.enum(["all", "user", "group"]),
      targetUserId: z.string().nullable(),
      targetGroup: z.string().nullable(),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    if (data.id) {
      await sql`update notifications set title=${data.title}, body=${data.body}, image_url=${data.imageUrl}, type=${data.type}, audience=${data.audience}, target_user_id=${data.targetUserId}, target_group=${data.targetGroup} where id=${data.id}`;
    } else {
      await sql`insert into notifications (title, body, image_url, type, audience, target_user_id, target_group, created_by)
        values (${data.title}, ${data.body}, ${data.imageUrl}, ${data.type}, ${data.audience}, ${data.targetUserId}, ${data.targetGroup}, ${context.userId})`;
    }
    await logActivity(sql, context.userId, "admin", "save_notification", data.title);
    return { ok: true };
  });

export const deleteNotification = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.number() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await requireAdmin(sql, context.userId);
    await sql`delete from notification_reads where notification_id = ${data.id}`;
    await sql`delete from notifications where id = ${data.id}`;
    return { ok: true };
  });
