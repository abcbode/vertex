import { useNavigate } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { adminPing, prepareAdminLogin } from "@/lib/server/admin";

function accountToEmail(raw: string) {
  const v = raw.trim();
  if (!v) return v;
  if (v.includes("@")) return v;
  if (v.toLowerCase() === "admin") return "admin@vertex.app";
  return v;
}

export function AdminLoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await prepareAdminLogin();
      const email = accountToEmail(username);
      const { error } = await authClient.signIn.email({ email, password });
      if (error) throw new Error("Sai tài khoản hoặc mật khẩu");
      const p = await adminPing();
      if (!p.isAdmin) throw new Error("Sai tài khoản hoặc mật khẩu");
      if (!p.twoFaOk) {
        nav({ to: "/bode/verify" });
        return;
      }
      onSuccess?.();
      nav({ to: "/bode" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-background p-6 surface-grid">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg">
        <Logo />
        <div className="mt-4 flex items-center gap-2 text-steel">
          <Shield className="size-4" />
          <span className="text-xs tracking-wide uppercase">Khu vực quản trị</span>
        </div>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">Đăng nhập admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">Nhập tài khoản và mật khẩu quản trị để tiếp tục.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="admin-user">Tài khoản</Label>
            <Input
              id="admin-user"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-pass">Mật khẩu</Label>
            <Input
              id="admin-pass"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button className="w-full" disabled={busy}>
            {busy ? "Đang xử lý…" : "Đăng nhập"}
          </Button>
        </form>
      </div>
    </main>
  );
}
