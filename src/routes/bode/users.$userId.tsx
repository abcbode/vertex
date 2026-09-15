import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { vnd } from "@/lib/format";
import { getUserAdmin, resetUserPassword, setUserRole, setUserStatus } from "@/lib/server/admin";

export const Route = createFileRoute("/bode/users/$userId")({ component: UserDetail });

function UserDetail() {
  const { userId } = Route.useParams();
  const [u, setU] = useState<Awaited<ReturnType<typeof getUserAdmin>> | null>(null);
  function load() {
    getUserAdmin({ data: { userId } }).then(setU).catch((e) => toast.error(String(e)));
  }
  useEffect(() => {
    load();
  }, [userId]);
  if (!u) return <AdminShell>Đang tải…</AdminShell>;
  return (
    <AdminShell>
      <Link to="/bode/users" className="text-sm text-muted-foreground">← Danh sách</Link>
      <h1 className="mt-2 text-xl font-semibold">{u.email}</h1>
      <p className="text-sm text-muted-foreground">{u.displayName} · {u.phone || "chưa có SĐT"} · {u.role}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Số dư</div><div className="font-mono text-xl">{vnd(u.wallet.balance)}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Tổng nạp</div><div className="font-mono text-xl">{vnd(u.wallet.totalDeposit)}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Tổng rút</div><div className="font-mono text-xl">{vnd(u.wallet.totalWithdraw)}</div></CardContent></Card>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setUserStatus({ data: { userId, status: u.status === "locked" ? "active" : "locked" } }).then(load)}>
          {u.status === "locked" ? "Mở khóa" : "Khóa user"}
        </Button>
        <Button variant="outline" onClick={() => setUserRole({ data: { userId, role: u.role === "admin" ? "user" : "admin" } }).then(load).catch((e) => toast.error(e instanceof Error ? e.message : "Lỗi"))}>
          {u.role === "admin" ? "Hạ user" : "Cấp admin"}
        </Button>
        <Button variant="outline" onClick={async () => toast.success((await resetUserPassword({ data: { userId } })).password)}>
          Reset mật khẩu
        </Button>
      </div>
      <h2 className="mt-8 mb-2 text-sm font-medium">Lịch sử trade</h2>
      <div className="divide-y divide-border rounded-xl border border-border text-sm">
        {u.trades.map((t) => (
          <div key={t.id} className="flex justify-between p-3">
            <span>{t.symbol} {t.direction}</span>
            <span>{vnd(t.amount)} <Badge variant={t.status === "win" ? "up" : "down"}>{t.status}</Badge></span>
          </div>
        ))}
      </div>
      <h2 className="mt-8 mb-2 text-sm font-medium">Lịch sử đăng nhập</h2>
      <div className="divide-y divide-border rounded-xl border border-border text-sm">
        {u.logins.map((l) => (
          <div key={l.id} className="p-3">{new Date(l.createdAt).toLocaleString("vi-VN")} · {l.userAgent}</div>
        ))}
      </div>
    </AdminShell>
  );
}
