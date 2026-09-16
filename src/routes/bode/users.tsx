import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { vnd } from "@/lib/format";
import { listUsers, resetUserPassword, setUserStatus } from "@/lib/server/admin";

export const Route = createFileRoute("/bode/users")({ component: UsersPage });

function UsersPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Awaited<ReturnType<typeof listUsers>> | null>(null);

  function load() {
    listUsers({ data: { q, page, status } }).then(setData).catch((e) => toast.error(String(e)));
  }
  useEffect(() => {
    load();
  }, [q, page, status]);

  return (
    <AdminShell>
      <h1 className="mb-4 text-xl font-semibold">Người dùng</h1>
      <div className="mb-3 flex flex-wrap gap-2">
        <Input placeholder="Tìm email / tên" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="max-w-xs" />
        <select className="h-11 rounded-md border border-input bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Tất cả</option>
          <option value="active">Hoạt động</option>
          <option value="locked">Khóa</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs text-muted-foreground">
            <tr>
              <th className="p-2">Email</th>
              <th className="p-2">Số dư</th>
              <th className="p-2">Nạp</th>
              <th className="p-2">Rút</th>
              <th className="p-2">Trạng thái</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {(data?.rows ?? []).map((u) => (
              <tr key={u.userId} className="border-t border-border">
                <td className="p-2">
                  <Link to="/bode/users/$userId" params={{ userId: u.userId }} className="hover:underline">
                    {u.email}
                  </Link>
                  <div className="text-xs text-muted-foreground">{u.displayName} · {u.role}</div>
                </td>
                <td className="p-2 font-mono">{vnd(u.balance)}</td>
                <td className="p-2 font-mono">{vnd(u.totalDeposit)}</td>
                <td className="p-2 font-mono">{vnd(u.totalWithdraw)}</td>
                <td className="p-2">
                  <Badge variant={u.status === "locked" ? "down" : "up"}>{u.status}</Badge>
                </td>
                <td className="p-2">
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => setUserStatus({ data: { userId: u.userId, status: u.status === "locked" ? "active" : "locked" } }).then(load)}>
                      {u.status === "locked" ? "Mở khóa" : "Khóa"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        const r = await resetUserPassword({ data: { userId: u.userId } });
                        toast.success(`Mật khẩu tạm: ${r.password}`);
                      }}
                    >
                      Reset MK
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Trước</Button>
        <Button size="sm" variant="outline" onClick={() => setPage((p) => p + 1)}>Sau</Button>
      </div>
    </AdminShell>
  );
}
