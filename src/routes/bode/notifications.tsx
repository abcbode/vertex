import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deleteNotification, listNotificationsAdmin, saveNotification } from "@/lib/server/cms";

export const Route = createFileRoute("/bode/notifications")({ component: NotiAdmin });

function NotiAdmin() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listNotificationsAdmin>>>([]);
  const [form, setForm] = useState({
    title: "",
    body: "",
    imageUrl: "",
    type: "in_app" as "in_app" | "popup" | "both",
    audience: "all" as "all" | "user" | "group",
    targetUserId: "",
    targetGroup: "active",
  });
  function load() {
    listNotificationsAdmin().then(setRows).catch((e) => toast.error(String(e)));
  }
  useEffect(() => { load(); }, []);
  return (
    <AdminShell>
      <h1 className="mb-4 text-xl font-semibold">Thông báo</h1>
      <div className="grid gap-2 rounded-xl border border-border p-4">
        <Input placeholder="Tiêu đề" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Textarea placeholder="Nội dung" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        <Input placeholder="URL hình (tuỳ chọn)" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        <div className="flex flex-wrap gap-2">
          <select className="h-11 rounded-md border border-input bg-background px-3 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}>
            <option value="in_app">Trong app</option>
            <option value="popup">Popup</option>
            <option value="both">Cả hai</option>
          </select>
          <select className="h-11 rounded-md border border-input bg-background px-3 text-sm" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value as typeof form.audience })}>
            <option value="all">Toàn bộ user</option>
            <option value="user">Một user</option>
            <option value="group">Nhóm</option>
          </select>
        </div>
        {form.audience === "user" && <Input placeholder="User ID" value={form.targetUserId} onChange={(e) => setForm({ ...form, targetUserId: e.target.value })} />}
        {form.audience === "group" && (
          <select className="h-11 rounded-md border border-input bg-background px-3 text-sm" value={form.targetGroup} onChange={(e) => setForm({ ...form, targetGroup: e.target.value })}>
            <option value="active">User hoạt động</option>
            <option value="locked">User bị khóa</option>
          </select>
        )}
        <Button onClick={() => saveNotification({
          data: {
            title: form.title,
            body: form.body,
            imageUrl: form.imageUrl,
            type: form.type,
            audience: form.audience,
            targetUserId: form.audience === "user" ? form.targetUserId : null,
            targetGroup: form.audience === "group" ? form.targetGroup : null,
          },
        }).then(() => { toast.success("Đã gửi"); load(); })}>Gửi thông báo</Button>
      </div>
      <div className="mt-6 space-y-2">
        {rows.map((n) => (
          <div key={n.id} className="flex justify-between gap-3 rounded-xl border border-border p-3 text-sm">
            <div>
              <div className="font-medium">{n.title}</div>
              <div className="text-xs text-muted-foreground">{n.type} · {n.audience} · đã đọc {n.reads}</div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => deleteNotification({ data: { id: n.id } }).then(load)}>Xóa</Button>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
