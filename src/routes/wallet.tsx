import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TYPE_LABEL, vnd } from "@/lib/format";
import { getWallet, listLedger } from "@/lib/server/user";

export const Route = createFileRoute("/wallet")({ component: WalletPage });

function WalletPage() {
  const [w, setW] = useState<Awaited<ReturnType<typeof getWallet>> | null>(null);
  const [led, setLed] = useState<Awaited<ReturnType<typeof listLedger>> | null>(null);
  useEffect(() => {
    getWallet().then(setW).catch(() => {});
    listLedger({ data: { page: 1 } }).then(setLed).catch(() => {});
  }, []);
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-4 p-4">
        <h1 className="text-xl font-semibold">Ví tiền</h1>
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Số dư</div>
              <div className="mt-1 font-mono text-xl tabular">{vnd(w?.wallet.balance ?? 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Tổng đã nạp</div>
              <div className="mt-1 font-mono text-xl tabular">{vnd(w?.wallet.totalDeposit ?? 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Tổng đã rút</div>
              <div className="mt-1 font-mono text-xl tabular">{vnd(w?.wallet.totalWithdraw ?? 0)}</div>
            </CardContent>
          </Card>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/deposit">Nạp tiền</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/withdraw">Rút tiền</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/history">Lịch sử</Link>
          </Button>
        </div>
        <h2 className="text-sm font-medium text-muted-foreground">Biến động số dư</h2>
        <div className="divide-y divide-border rounded-xl border border-border">
          {(led?.rows ?? []).map((r) => (
            <div key={r.id} className="flex items-center justify-between p-3 text-sm">
              <div>
                <div>{TYPE_LABEL[r.type] ?? r.type}</div>
                <div className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString("vi-VN")}</div>
              </div>
              <div className="text-right">
                <div className={r.amount >= 0 ? "text-up" : "text-down"}>
                  {r.amount >= 0 ? "+" : ""}
                  {vnd(r.amount)}
                </div>
                <div className="text-xs text-muted-foreground">{vnd(r.balanceAfter)}</div>
              </div>
            </div>
          ))}
          {(led?.rows ?? []).length === 0 && <p className="p-4 text-sm text-muted-foreground">Chưa có giao dịch.</p>}
        </div>
      </div>
    </AppShell>
  );
}
