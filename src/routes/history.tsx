import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STATUS_LABEL, vnd } from "@/lib/format";
import { listMyTrades } from "@/lib/server/trade";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/history")({ component: HistoryPage });

function HistoryPage() {
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Awaited<ReturnType<typeof listMyTrades>> | null>(null);

  useEffect(() => {
    listMyTrades({ data: { page, status, from, to } }).then(setData).catch(() => {});
  }, [page, status, from, to]);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-4 p-4">
        <h1 className="text-xl font-semibold">Lịch sử trade</h1>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="text-up">Lãi {vnd(data?.win ?? 0)} ({data?.winCount ?? 0})</span>
          <span className="text-down">Lỗ {vnd(data?.loss ?? 0)} ({data?.lossCount ?? 0})</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {["all", "win", "loss", "running"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setStatus(s); setPage(1); }}
              className={cn("rounded-full border border-border px-3 py-1 text-xs", status === s && "bg-accent")}
            >
              {s === "all" ? "Tất cả" : STATUS_LABEL[s] ?? s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="divide-y divide-border rounded-xl border border-border">
          {(data?.rows ?? []).map((r) => (
            <div key={r.id} className="flex items-center justify-between p-3 text-sm">
              <div>
                <div className="font-medium">{r.symbol} · {r.direction.toUpperCase()}</div>
                <div className="text-xs text-muted-foreground">{new Date(r.openedAt).toLocaleString("vi-VN")}</div>
              </div>
              <div className="text-right">
                <div className="font-mono">{vnd(r.amount)}</div>
                <Badge variant={r.status === "win" ? "up" : r.status === "loss" ? "down" : "outline"}>
                  {STATUS_LABEL[r.status] ?? r.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Trước</Button>
          <Button variant="outline" size="sm" disabled={(data?.rows.length ?? 0) < 20} onClick={() => setPage((p) => p + 1)}>Sau</Button>
        </div>
      </div>
    </AppShell>
  );
}
