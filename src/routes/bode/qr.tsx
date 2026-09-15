import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listBanksAdmin, listQrAdmin, saveQr, toggleQr } from "@/lib/server/admin";
import { getSettings, saveSettings } from "@/lib/server/admin";

export const Route = createFileRoute("/bode/qr")({ component: QrPage });

function QrPage() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listQrAdmin>>>([]);
  const [banks, setBanks] = useState<Awaited<ReturnType<typeof listBanksAdmin>>>([]);
  const [label, setLabel] = useState("QR");
  const [imageUrl, setImageUrl] = useState("");
  const [bankId, setBankId] = useState<number | null>(null);
  const [prefix, setPrefix] = useState("VERTEX");
  function load() {
    listQrAdmin().then(setRows).catch((e) => toast.error(String(e)));
    listBanksAdmin().then(setBanks).catch(() => {});
    getSettings().then((s) => setPrefix(s.transfer_prefix ?? "VERTEX")).catch(() => {});
  }
  useEffect(() => { load(); }, []);
  return (
    <AdminShell>
      <h1 className="mb-4 text-xl font-semibold">QR Code</h1>
      <div className="mb-6 flex gap-2">
        <Input value={prefix} onChange={(e) => setPrefix(e.target.value)} />
        <Button onClick={() => saveSettings({ data: { transfer_prefix: prefix } }).then(() => toast.success("Đã lưu nội dung CK"))}>Nội dung CK mặc định</Button>
      </div>
      {rows.map((q) => (
        <div key={q.id} className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-border p-3">
          <div className="flex items-center gap-3">
            {q.imageUrl ? <img src={q.imageUrl} alt="" className="size-16 rounded-md object-cover" /> : <div className="grid size-16 place-items-center rounded-md bg-muted text-xs">VietQR</div>}
            <div>
              <div className="font-medium">{q.label}</div>
              <div className="text-xs text-muted-foreground">{q.isActive ? "Bật" : "Tắt"}</div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => toggleQr({ data: { id: q.id } }).then(load)}>{q.isActive ? "Tắt" : "Bật"}</Button>
            <Button size="sm" variant="ghost" onClick={() => toggleQr({ data: { id: q.id, del: true } }).then(load)}>Xóa</Button>
          </div>
        </div>
      ))}
      <div className="mt-4 space-y-2 rounded-xl border border-border p-4">
        <Input placeholder="Nhãn" value={label} onChange={(e) => setLabel(e.target.value)} />
        <select className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm" value={bankId ?? ""} onChange={(e) => setBankId(e.target.value ? Number(e.target.value) : null)}>
          <option value="">Không gắn NH</option>
          {banks.map((b) => <option key={b.id} value={b.id}>{b.bankName} {b.accountNumber}</option>)}
        </select>
        <Input placeholder="URL ảnh QR (để trống = VietQR tự sinh)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = () => setImageUrl(String(r.result));
            r.readAsDataURL(f);
          }}
        />
        <Button onClick={() => saveQr({ data: { label, imageUrl, bankAccountId: bankId } }).then(() => { toast.success("Đã thêm"); load(); })}>Thêm QR</Button>
      </div>
    </AdminShell>
  );
}
