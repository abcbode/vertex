import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/server/user";

export const Route = createFileRoute("/forgot-password")({ component: Forgot });

function Forgot() {
  const [email, setEmail] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await requestPasswordReset({ data: { email } });
      if (res.token) setLink(`/reset-password?token=${res.token}`);
      else toast.success("Nếu email tồn tại, hướng dẫn đã được tạo.");
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
        <h1 className="mt-4 text-xl font-semibold">Quên mật khẩu</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button className="w-full" disabled={busy}>
            Gửi yêu cầu
          </Button>
        </form>
        {link && (
          <p className="mt-4 text-sm">
            Môi trường demo — dùng liên kết:{" "}
            <a href={link} className="text-steel underline">
              Đặt lại mật khẩu
            </a>
          </p>
        )}
        <Link to="/login" className="mt-4 block text-center text-sm text-muted-foreground">
          Quay lại đăng nhập
        </Link>
      </div>
    </main>
  );
}
