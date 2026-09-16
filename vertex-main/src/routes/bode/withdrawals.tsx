import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STATUS_LABEL, vnd } from "@/lib/format";
import { listAdminWithdrawals, reviewWithdraw } from "@/lib/server/admin";

export const Route = createFileRoute("/bode/withdrawals")({ component: Withdrawals });

function Withdrawals() {
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Awaited<ReturnType<typeof listAdminWithdrawals>> | null>(null);
  function load() {
    listAdminWithdrawals({ data: { page, status } }).then(setData).catch((e) => toast.error(String(e)));
  }
  useEffect(() => { load(); }, [status, page]);
  return (
    <AdminShell>
      <h1 className="mb-4 text-xl font-semibold">Rút tiền</h1>
      <select className="mb-3 h-11 rounded-md border border-input bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="all">Tất cả</option>
        <option value="pending">Chờ duyệt</option>
        <option value="approved">Đã duyệt</option>
        <option value="paid">Đã thanh toán</option>
        <option value="rejected">Từ chối</option>
      </select>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs text-muted-foreground">
            <tr>
              <th className="p-2">User</th>
              <th className="p-2">Nhận</th>
              <th className="p-2">Số tiền</th>
              <th className="p-2">TT</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {(data?.rows ?? []).map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-2">{r.email}</td>
                <td className="p-2 text-xs">{r.bankName}<br />{r.accountNumber}<br />{r.accountName}</td>
                <td className="p-2 font-mono">{vnd(r.amount)}</td>
                <td className="p-2"><Badge>{STATUS_LABEL[r.status]}</Badge></td>
                <td className="p-2">
                  <div className="flex flex-col gap-1">
                    {r.status === "pending" && <Button size="sm" variant="up" onClick={() => reviewWithdraw({ data: { id: r.id, action: "approve" } }).then(load)}>Duyệt</Button>}
                    {(r.status === "pending" || r.status === "approved") && <Button size="sm" onClick={() => reviewWithdraw({ data: { id: r.id, action: "paid" } }).then(load)}>Đã trả</Button>}
                    {(r.status === "pending" || r.status === "approved") && <Button size="sm" variant="down" onClick={() => reviewWithdraw({ data: { id: r.id, action: "reject" } }).then(load)}>Từ chối</Button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
