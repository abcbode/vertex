import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STATUS_LABEL, vnd } from "@/lib/format";
import { listAdminDeposits, reviewDeposit } from "@/lib/server/admin";

export const Route = createFileRoute("/bode/deposits")({ component: Deposits });

function Deposits() {
  const [status, setStatus] = useState("pending");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Awaited<ReturnType<typeof listAdminDeposits>> | null>(null);
  function load() {
    listAdminDeposits({ data: { page, status, q } }).then(setData).catch((e) => toast.error(String(e)));
  }
  useEffect(() => { load(); }, [status, q, page]);
  return (
    <AdminShell>
      <h1 className="mb-4 text-xl font-semibold">Nạp tiền</h1>
      <div className="mb-3 flex flex-wrap gap-2">
        <Input placeholder="Email / nội dung / ID" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <select className="h-11 rounded-md border border-input bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Tất cả</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Thành công</option>
          <option value="rejected">Từ chối</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs text-muted-foreground">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">User</th>
              <th className="p-2">Số tiền</th>
              <th className="p-2">Nội dung</th>
              <th className="p-2">Trạng thái</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {(data?.rows ?? []).map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-2 font-mono">{r.id}</td>
                <td className="p-2">{r.email}</td>
                <td className="p-2 font-mono">{vnd(r.amount)}</td>
                <td className="p-2 font-mono text-xs">{r.content}</td>
                <td className="p-2"><Badge>{STATUS_LABEL[r.status]}</Badge></td>
                <td className="p-2">
                  {r.status === "pending" && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="up" onClick={() => reviewDeposit({ data: { id: r.id, action: "approve" } }).then(load)}>Duyệt</Button>
                      <Button size="sm" variant="down" onClick={() => reviewDeposit({ data: { id: r.id, action: "reject" } }).then(load)}>Từ chối</Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
