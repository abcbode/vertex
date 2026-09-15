import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VN_BANKS } from "@/lib/format";
import { listBanksAdmin, saveBank, toggleBank } from "@/lib/server/admin";

export const Route = createFileRoute("/bode/banks")({ component: Banks });

function Banks() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listBanksAdmin>>>([]);
  const [form, setForm] = useState({ bankName: "Vietcombank", bankCode: "970436", accountNumber: "", accountName: "", branch: "" });
  function load() {
    listBanksAdmin().then(setRows).catch((e) => toast.error(String(e)));
  }
  useEffect(() => { load(); }, []);
  return (
    <AdminShell>
      <h1 className="mb-4 text-xl font-semibold">Tài khoản ngân hàng nhận</h1>
      <div className="space-y-3">
        {rows.map((b) => (
          <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3 text-sm">
            <div>
              <div className="font-medium">{b.bankName} {b.isDefault && <Badge>Mặc định</Badge>}</div>
              <div className="font-mono text-xs">{b.accountNumber} · {b.accountName}</div>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => toggleBank({ data: { id: b.id, field: "active" } }).then(load)}>{b.isActive ? "Tắt" : "Bật"}</Button>
              <Button size="sm" variant="outline" onClick={() => toggleBank({ data: { id: b.id, field: "default" } }).then(load)}>Mặc định</Button>
              <Button size="sm" variant="ghost" onClick={() => toggleBank({ data: { id: b.id, field: "delete" } }).then(load)}>Xóa</Button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-2 rounded-xl border border-border p-4 sm:grid-cols-2">
        <select className="h-11 rounded-md border border-input bg-background px-3 text-sm sm:col-span-2" value={form.bankCode} onChange={(e) => {
          const b = VN_BANKS.find((x) => x.code === e.target.value);
          setForm({ ...form, bankCode: e.target.value, bankName: b?.name ?? form.bankName });
        }}>
          {VN_BANKS.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
        </select>
        <Input placeholder="Số TK" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} />
        <Input placeholder="Chủ TK" value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} />
        <Input placeholder="Chi nhánh" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} />
        <Button onClick={() => saveBank({ data: form }).then(() => { toast.success("Đã lưu"); load(); })}>Thêm</Button>
      </div>
    </AdminShell>
  );
}
