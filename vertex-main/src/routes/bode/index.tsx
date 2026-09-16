import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { vnd } from "@/lib/format";
import { getDashboard } from "@/lib/server/admin";

export const Route = createFileRoute("/bode/")({ component: Dash });

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`mt-1 font-mono text-xl tabular ${tone ?? ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function Dash() {
  const [d, setD] = useState<Awaited<ReturnType<typeof getDashboard>> | null>(null);
  useEffect(() => {
    getDashboard({ data: { range: "all" } }).then(setD).catch(() => {});
  }, []);
  const max = Math.max(1, ...(d?.series.map((s) => Math.max(s.deposit, s.withdraw, s.volume)) ?? [1]));
  return (
    <AdminShell>
      <h1 className="mb-4 text-xl font-semibold">Dashboard</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Tổng user" value={String(d?.users.total ?? 0)} />
        <Stat label="User mới (24h)" value={String(d?.users.neu ?? 0)} />
        <Stat label="Đang hoạt động" value={String(d?.users.active ?? 0)} />
        <Stat label="Bị khóa" value={String(d?.users.locked ?? 0)} />
        <Stat label="Tổng nạp" value={vnd(d?.totalDeposit ?? 0)} />
        <Stat label="Tổng rút" value={vnd(d?.totalWithdraw ?? 0)} />
        <Stat label="Volume trade" value={vnd(d?.volume ?? 0)} />
        <Stat label="P/L hệ thống" value={vnd(d?.pnl ?? 0)} tone={(d?.pnl ?? 0) >= 0 ? "text-up" : "text-down"} />
        <Stat label="Tiền thắng (user)" value={vnd(d?.totalWin ?? 0)} tone="text-up" />
        <Stat label="Tiền thua (user)" value={vnd(d?.totalLoss ?? 0)} tone="text-down" />
        <Stat label="Nạp hôm nay" value={vnd(d?.depositToday ?? 0)} />
        <Stat label="Rút hôm nay" value={vnd(d?.withdrawToday ?? 0)} />
      </div>
      <h2 className="mt-8 mb-3 text-sm font-medium text-muted-foreground">14 ngày gần nhất</h2>
      <div className="flex h-40 items-end gap-1 rounded-xl border border-border p-3">
        {(d?.series ?? []).map((s) => (
          <div key={s.date} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-28 w-full items-end justify-center gap-px">
              <div className="w-1/3 bg-steel/80" style={{ height: `${(s.deposit / max) * 100}%` }} />
              <div className="w-1/3 bg-down/70" style={{ height: `${(s.withdraw / max) * 100}%` }} />
              <div className="w-1/3 bg-up/70" style={{ height: `${(s.volume / max) * 100}%` }} />
            </div>
            <span className="text-[9px] text-muted-foreground">{s.date.slice(5)}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Cột: nạp / rút / volume</p>
    </AdminShell>
  );
}
