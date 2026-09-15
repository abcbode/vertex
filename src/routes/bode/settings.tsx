import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { confirmAdmin2fa, disableAdmin2fa, exportBackup, getSettings, listErrors, saveSettings, setupAdmin2fa } from "@/lib/server/admin";
import { authClient } from "@/lib/auth/client";

export const Route = createFileRoute("/bode/settings")({ component: SettingsPage });

function SettingsPage() {
  const [s, setS] = useState<Record<string, string>>({});
  const [secret, setSecret] = useState<string | null>(null);
  const [uri, setUri] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<Awaited<ReturnType<typeof listErrors>>>([]);
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  useEffect(() => {
    getSettings().then(setS).catch((e) => toast.error(String(e)));
    listErrors().then(setErrors).catch(() => {});
  }, []);
  function set(k: string, v: string) {
    setS((p) => ({ ...p, [k]: v }));
  }
  return (
    <AdminShell>
      <h1 className="mb-4 text-xl font-semibold">Cài đặt hệ thống</h1>
      <div className="grid max-w-lg gap-3">
        <div className="space-y-1.5"><Label>Tên sàn</Label><Input value={s.site_name ?? ""} onChange={(e) => set("site_name", e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Prefix nội dung CK</Label><Input value={s.transfer_prefix ?? ""} onChange={(e) => set("transfer_prefix", e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Thưởng chào mừng</Label><Input value={s.welcome_bonus ?? ""} onChange={(e) => set("welcome_bonus", e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Nạp tối thiểu</Label><Input value={s.min_deposit ?? ""} onChange={(e) => set("min_deposit", e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Rút tối thiểu</Label><Input value={s.min_withdraw ?? ""} onChange={(e) => set("min_withdraw", e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Trade tối thiểu</Label><Input value={s.min_trade ?? ""} onChange={(e) => set("min_trade", e.target.value)} /></div>
        <div className="flex items-center justify-between rounded-md border border-border p-3">
          <Label>Bảo trì giao dịch</Label>
          <Switch checked={s.maintenance === "true"} onCheckedChange={(c) => set("maintenance", c ? "true" : "false")} />
        </div>
        <Button onClick={() => saveSettings({ data: s }).then(() => toast.success("Đã lưu"))}>Lưu cài đặt</Button>
      </div>
      <h2 className="mt-8 mb-2 font-medium">Đổi mật khẩu admin</h2>
      <form className="flex max-w-lg flex-col gap-2" onSubmit={async (e) => {
        e.preventDefault();
        const { error } = await authClient.changePassword({ currentPassword: cur, newPassword: next });
        if (error) toast.error(error.message);
        else toast.success("Đã đổi mật khẩu");
      }}>
        <Input type="password" placeholder="Mật khẩu hiện tại" value={cur} onChange={(e) => setCur(e.target.value)} />
        <Input type="password" placeholder="Mật khẩu mới" value={next} onChange={(e) => setNext(e.target.value)} />
        <Button type="submit">Đổi mật khẩu</Button>
      </form>
      <h2 className="mt-8 mb-2 font-medium">2FA quản trị</h2>
      <div className="max-w-lg space-y-2">
        <Button variant="outline" onClick={async () => {
          const r = await setupAdmin2fa();
          setSecret(r.secret);
          setUri(r.uri);
        }}>Tạo secret 2FA</Button>
        {secret && (
          <div className="rounded-md border border-border p-3 text-sm">
            <p>Nhập secret vào Google Authenticator:</p>
            <p className="font-mono">{secret}</p>
            <img alt="QR 2FA" className="mt-2 size-40 bg-primary" src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(uri)}`} />
            <Input className="mt-2" placeholder="Mã 6 số" value={code} onChange={(e) => setCode(e.target.value)} />
            <Button className="mt-2" onClick={() => confirmAdmin2fa({ data: { code } }).then(() => toast.success("Đã bật 2FA"))}>Xác nhận bật</Button>
            <Button className="mt-2" variant="outline" onClick={() => disableAdmin2fa({ data: { code } }).then(() => toast.success("Đã tắt 2FA"))}>Tắt 2FA</Button>
          </div>
        )}
      </div>
      <h2 className="mt-8 mb-2 font-medium">Sao lưu dữ liệu</h2>
      <Button variant="outline" onClick={async () => {
        const dump = await exportBackup();
        const blob = new Blob([dump.json], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `vertex-backup-${Date.now()}.json`;
        a.click();
      }}>Tải bản sao lưu JSON</Button>
      <h2 className="mt-8 mb-2 font-medium">Error log</h2>
      <div className="divide-y divide-border rounded-xl border border-border text-sm">
        {errors.map((e) => (
          <div key={e.id} className="p-3">{e.message}<div className="text-xs text-muted-foreground">{new Date(e.createdAt).toLocaleString("vi-VN")}</div></div>
        ))}
        {errors.length === 0 && <p className="p-3 text-muted-foreground">Không có lỗi.</p>}
      </div>
    </AdminShell>
  );
}
