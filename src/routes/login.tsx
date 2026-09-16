import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) throw new Error(error.message ?? "Đăng nhập thất bại");
      nav({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-background p-6 surface-grid">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6">
        <Logo />
        <h1 className="mt-4 text-xl font-semibold tracking-tight">Đăng nhập</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sàn giao dịch Binary Options VERTEX</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button className="w-full" disabled={busy}>
            {busy ? "Đang xử lý…" : "Đăng nhập"}
          </Button>
        </form>
        <div className="mt-3 flex justify-between text-sm">
          <Link to="/forgot-password" className="text-muted-foreground hover:text-foreground">
            Quên mật khẩu
          </Link>
          <Link to="/register" className="text-steel hover:text-foreground">
            Đăng ký
          </Link>
        </div>
        {authEnabled && (
          <div className="mt-6 space-y-2 border-t border-border pt-4">
            {GROK_PROVIDERS.map((p) => (
              <Button key={p.providerId} type="button" variant="outline" className="w-full" onClick={() => signIn(p.providerId, { callbackURL: "/" })}>
                Tiếp tục với {p.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
