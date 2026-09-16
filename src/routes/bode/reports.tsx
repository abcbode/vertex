import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { vnd } from "@/lib/format";
import { getDashboard, listActivity } from "@/lib/server/admin";

export const Route = createFileRoute("/bode/reports")({ component: Reports });

function Reports() {
  const [d, setD] = useState<Awaited<ReturnType<typeof getDashboard>> | null>(null);
  const [logs, setLogs] = useState<Awaited<ReturnType<typeof listActivity>>>([]);
  useEffect(() => {
    getDashboard({ data: { range: "month" } }).then(setD).catch(() => {});
    listActivity({ data: { page: 1 } }).then(setLogs).catch(() => {});
  }, []);
  return (
    <AdminShell>
      <h1 className="mb-4 text-xl font-semibold">Báo cáo</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Volume</div><div className="font-mono text-xl">{vnd(d?.volume ?? 0)}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">UP / DOWN</div><div className="font-mono text-xl">{d?.upCount ?? 0} / {d?.downCount ?? 0}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">WIN / LOSS</div><div className="font-mono text-xl">{d?.winCount ?? 0} / {d?.lossCount ?? 0}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">P/L hệ thống</div><div className="font-mono text-xl">{vnd(d?.pnl ?? 0)}</div></CardContent></Card>
      </div>
      <h2 className="mt-8 mb-2 text-sm font-medium">Nhật ký hoạt động</h2>
      <div className="divide-y divide-border rounded-xl border border-border text-sm">
        {logs.map((l) => (
          <div key={l.id} className="p-3">
            <div className="flex justify-between">
              <span>{l.role} · {l.action}</span>
              <span className="text-xs text-muted-foreground">{new Date(l.createdAt).toLocaleString("vi-VN")}</span>
            </div>
            <div className="text-xs text-muted-foreground">{l.detail}</div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
