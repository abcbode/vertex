import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { UserButton } from "@/lib/auth/gates";
import { getBootstrap } from "@/lib/server/core";
import { changeEmail, listLoginHistory, updateProfile } from "@/lib/server/user";

export const Route = createFileRoute("/account")({ component: AccountPage });

function AccountPage() {
  const { user } = useCurrentUserState();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [logins, setLogins] = useState<Awaited<ReturnType<typeof listLoginHistory>>>([]);

  useEffect(() => {
    getBootstrap().then((b) => {
      setName(b.profile.displayName);
      setPhone(b.profile.phone);
      setEmail(b.profile.email);
    }).catch(() => {});
    listLoginHistory().then(setLogins).catch(() => {});
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Tài khoản</h1>
          <UserButton />
        </div>
        <p className="text-sm text-muted-foreground">{user?.primaryEmail}</p>
        <form
          className="space-y-3 rounded-xl border border-border p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await updateProfile({ data: { displayName: name, phone } });
              toast.success("Đã lưu thông tin");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Lỗi");
            }
          }}
        >
          <h2 className="font-medium">Sửa thông tin</h2>
          <div className="space-y-1.5">
            <Label>Tên</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Số điện thoại</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button type="submit">Lưu</Button>
        </form>
        <form
          className="space-y-3 rounded-xl border border-border p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await changeEmail({ data: { email } });
              toast.success("Đã đổi email");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Lỗi");
            }
          }}
        >
          <h2 className="font-medium">Đổi email</h2>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit">Cập nhật email</Button>
        </form>
        <form
          className="space-y-3 rounded-xl border border-border p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const { error } = await authClient.changePassword({ currentPassword: cur, newPassword: next });
              if (error) throw new Error(error.message);
              toast.success("Đã đổi mật khẩu");
              setCur("");
              setNext("");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Lỗi");
            }
          }}
        >
          <h2 className="font-medium">Đổi mật khẩu</h2>
          <Input type="password" placeholder="Mật khẩu hiện tại" value={cur} onChange={(e) => setCur(e.target.value)} />
          <Input type="password" placeholder="Mật khẩu mới" minLength={8} value={next} onChange={(e) => setNext(e.target.value)} />
          <Button type="submit">Đổi mật khẩu</Button>
        </form>
        <div>
          <h2 className="mb-2 font-medium">Lịch sử đăng nhập</h2>
          <div className="divide-y divide-border rounded-xl border border-border text-sm">
            {logins.map((l) => (
              <div key={l.id} className="p-3">
                <div>{new Date(l.createdAt).toLocaleString("vi-VN")}</div>
                <div className="text-xs text-muted-foreground">{l.userAgent}</div>
              </div>
            ))}
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={() => void signOut("/login")}>
          Đăng xuất
        </Button>
      </div>
    </AppShell>
  );
}
