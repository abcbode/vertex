import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordWithToken } from "@/lib/server/user";

export const Route = createFileRoute("/reset-password")({ component: Reset });

function Reset() {
  const nav = useNavigate();
  const token = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("token") ?? "" : "";
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await resetPasswordWithToken({ data: { token, password } });
      toast.success("Đã đổi mật khẩu");
      nav({ to: "/login" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6">
        <Logo />
        <h1 className="mt-4 text-xl font-semibold">Đặt lại mật khẩu</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="password">Mật khẩu mới</Label>
            <Input id="password" type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button className="w-full" disabled={busy || !token}>
            Cập nhật
          </Button>
        </form>
        <Link to="/login" className="mt-4 block text-center text-sm text-muted-foreground">
          Đăng nhập
        </Link>
      </div>
    </main>
  );
}
