import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { listSupportAdmin, saveSupport, toggleSupport } from "@/lib/server/cms";

export const Route = createFileRoute("/bode/support")({ component: SupportAdmin });

function SupportAdmin() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listSupportAdmin>>>([]);
  const empty = { name: "", avatarUrl: "", bio: "", telegram: "", zalo: "", messenger: "", phone: "", sortOrder: 0 };
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<number | undefined>();
  function load() {
    listSupportAdmin().then(setRows).catch((e) => toast.error(String(e)));
  }
  useEffect(() => { load(); }, []);
  return (
    <AdminShell>
      <h1 className="mb-4 text-xl font-semibold">CSKH</h1>
      {rows.map((a) => (
        <div key={a.id} className="mb-2 flex items-center justify-between rounded-xl border border-border p-3 text-sm">
          <div>
            <div className="font-medium">{a.name} {a.isActive ? "" : "(tắt)"}</div>
            <div className="text-xs text-muted-foreground">{a.phone} · thứ tự {a.sortOrder}</div>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => { setEditId(a.id); setForm({ name: a.name, avatarUrl: a.avatarUrl, bio: a.bio, telegram: a.telegram, zalo: a.zalo, messenger: a.messenger, phone: a.phone, sortOrder: a.sortOrder }); }}>Sửa</Button>
            <Button size="sm" variant="outline" onClick={() => toggleSupport({ data: { id: a.id } }).then(load)}>Bật/tắt</Button>
            <Button size="sm" variant="ghost" onClick={() => toggleSupport({ data: { id: a.id, del: true } }).then(load)}>Xóa</Button>
          </div>
        </div>
      ))}
      <div className="mt-4 grid gap-2 rounded-xl border border-border p-4">
        <Input placeholder="Tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Textarea placeholder="Giới thiệu" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        <Input placeholder="Telegram URL" value={form.telegram} onChange={(e) => setForm({ ...form, telegram: e.target.value })} />
        <Input placeholder="Zalo URL" value={form.zalo} onChange={(e) => setForm({ ...form, zalo: e.target.value })} />
        <Input placeholder="Messenger URL" value={form.messenger} onChange={(e) => setForm({ ...form, messenger: e.target.value })} />
        <Input placeholder="Số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Input placeholder="Thứ tự" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
        <Input placeholder="Avatar URL" value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} />
        <Button onClick={() => saveSupport({ data: { ...form, id: editId } }).then(() => { toast.success("Đã lưu"); setEditId(undefined); setForm(empty); load(); })}>
          {editId ? "Cập nhật" : "Thêm CSKH"}
        </Button>
      </div>
    </AdminShell>
  );
}
