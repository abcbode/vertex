import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { CandleChart } from "@/components/candle-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { countdown, priceFmt, vnd } from "@/lib/format";
import { getCandleHistory, getMarket, type Candle } from "@/lib/server/market";
import { listRunningTrades, placeTrade } from "@/lib/server/trade";
import { cn } from "@/lib/utils";

type Search = { asset?: number };

export const Route = createFileRoute("/trade")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    asset: s.asset ? Number(s.asset) : undefined,
  }),
  component: TradePage,
});

function TradePage() {
  const { asset: assetQ } = Route.useSearch();
  const [assetId, setAssetId] = useState(assetQ ?? 1);
  const [tf, setTf] = useState(15);
  const [expiry, setExpiry] = useState(30);
  const [amount, setAmount] = useState("100000");
  const [market, setMarket] = useState<Awaited<ReturnType<typeof getMarket>> | null>(null);
  const [running, setRunning] = useState<Awaited<ReturnType<typeof listRunningTrades>> | null>(null);
  const [pending, setPending] = useState<"up" | "down" | null>(null);
  const [freezePrice, setFreezePrice] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [history, setHistory] = useState<Candle[]>([]);

  const load = useCallback(async () => {
    try {
      const m = await getMarket({ data: { assetId, timeframe: tf } });
      setMarket(m);
      const r = await listRunningTrades();
      setRunning(r);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi thị trường");
    }
  }, [assetId, tf]);

  useEffect(() => {
    let busy = false;
    const tick = () => {
      if (busy) return;
      busy = true;
      void load().finally(() => {
        busy = false;
      });
    };
    tick();
    const t = setInterval(tick, 2500);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    setHistory([]);
    void getCandleHistory({ data: { assetId, timeframe: tf } })
      .then(setHistory)
      .catch(() => {});
  }, [assetId, tf]);

  const loadHistory = useCallback(() => {
    void getCandleHistory({ data: { assetId, timeframe: tf } })
      .then((rows) => setHistory((prev) => {
        const map = new Map(prev.map((c) => [c.time, c]));
        for (const c of rows) map.set(c.time, c);
        return [...map.values()].sort((a, b) => a.time - b.time);
      }))
      .catch(() => {});
  }, [assetId, tf]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  const amt = Number(amount) || 0;
  const payout = market?.asset.payout ?? 85;
  const receive = amt + (amt * payout) / 100;
  const ohlc = market?.ohlc;
  const livePrice = market?.asset.price ?? 0;
  const liveDecimals = market?.asset.decimals ?? 2;
  const entryLevels = useMemo(
    () =>
      (running?.rows ?? [])
        .filter((t) => t.status === "running")
        .map((t) => ({
          price: t.entryPrice,
          tone: (t.direction === "up" ? "up" : "down") as "up" | "down",
          label: `Mốc ${t.direction === "up" ? "UP" : "DOWN"} ${priceFmt(t.entryPrice, t.decimals)}`,
        })),
    [running],
  );

  async function confirm() {
    if (!pending) return;
    const freeze = freezePrice > 0 ? freezePrice : livePrice;
    if (!(freeze > 0) && !(livePrice > 0)) {
      toast.error("Giá thị trường chưa sẵn sàng, đợi nến chạy rồi đặt lại");
      await load();
      return;
    }
    try {
      const t = await placeTrade({
        data: {
          assetId,
          direction: pending,
          amount: amt,
          expirySeconds: expiry,
          ...(freeze > 0 ? { entryPrice: freeze } : {}),
        },
      });
      toast.success("Đã đặt lệnh");
      setPending(null);
      setRunning((prev) => ({
        balance: Math.max(0, (prev?.balance ?? 0) - amt),
        rows: [
          {
            id: t.id,
            symbol: t.symbol,
            decimals: t.decimals,
            direction: t.direction,
            amount: t.amount,
            payout: t.payout,
            entryPrice: t.entryPrice,
            status: t.status,
            profit: null,
            expiresAt: t.expiresAt,
            openedAt: t.openedAt,
          },
          ...(prev?.rows ?? []).filter((r) => r.id !== t.id),
        ],
      }));
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không đặt được lệnh");
    }
  }

  const quick = [50000, 100000, 200000, 500000, 1000000];

  return (
    <AppShell>
      <div className="mx-auto grid max-w-6xl gap-3 p-3 lg:grid-cols-[1fr_20rem]">
        <div className="flex min-h-[28rem] flex-col rounded-xl border border-border bg-card">
          <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
            <select
              className="h-10 rounded-md border border-input bg-background px-2 text-sm"
              value={assetId}
              onChange={(e) => setAssetId(Number(e.target.value))}
            >
              {(market?.assets ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.symbol}
                </option>
              ))}
            </select>
            <div className="flex rounded-md bg-muted p-1">
              {(market?.timeframes ?? []).map((t) => (
                <button
                  key={t.seconds}
                  type="button"
                  onClick={() => setTf(t.seconds)}
                  className={cn("h-8 rounded-sm px-2 text-xs", tf === t.seconds && "bg-card")}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="ml-auto text-right">
              <div className="font-mono text-lg tabular">
                {priceFmt(market?.asset.price ?? 0, market?.asset.decimals ?? 2)}
              </div>
              {ohlc && (
                <div className="flex gap-2 text-[11px] text-muted-foreground">
                  <span>O {priceFmt(ohlc.open, market?.asset.decimals ?? 2)}</span>
                  <span>H {priceFmt(ohlc.high, market?.asset.decimals ?? 2)}</span>
                  <span>L {priceFmt(ohlc.low, market?.asset.decimals ?? 2)}</span>
                  <span>C {priceFmt(ohlc.close, market?.asset.decimals ?? 2)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="min-h-72 flex-1">
            <CandleChart
              candles={market?.candles ?? []}
              history={history}
              decimals={liveDecimals}
              levels={entryLevels}
              onNeedHistory={loadHistory}
              resetKey={`${assetId}-${tf}`}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Số dư</span>
              <span className="font-mono tabular">{vnd(running?.balance ?? 0)}</span>
            </div>
            <div className="mt-3 space-y-1.5">
              <Label>Số tiền trade</Label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" />
              <div className="flex flex-wrap gap-1">
                {quick.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(String(q))}
                    className="rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"
                  >
                    {vnd(q)}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              <Label>Thời gian kết thúc</Label>
              <div className="flex flex-wrap gap-1">
                {(market?.expiries ?? []).map((e) => (
                  <button
                    key={e.seconds}
                    type="button"
                    onClick={() => setExpiry(e.seconds)}
                    className={cn(
                      "rounded-md border border-border px-2 py-1 text-xs",
                      expiry === e.seconds && "border-ring bg-accent",
                    )}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-muted-foreground">Payout</span>
              <span>{payout}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Có thể nhận</span>
              <span className="font-mono text-up tabular">{vnd(receive)}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="up" className="h-14 text-base" onClick={() => { setFreezePrice(livePrice); setPending("up"); }} disabled={market?.asset.paused || !(livePrice > 0)}>
                MUA / UP
              </Button>
              <Button variant="down" className="h-14 text-base" onClick={() => { setFreezePrice(livePrice); setPending("down"); }} disabled={market?.asset.paused || !(livePrice > 0)}>
                BÁN / DOWN
              </Button>
            </div>
            {market?.asset.paused && <p className="mt-2 text-xs text-warn">Tài sản đang tạm dừng.</p>}
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-medium">Lệnh đang chạy</h3>
            <div className="mt-2 space-y-2">
              {(running?.rows ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">Chưa có lệnh.</p>
              )}
              {(running?.rows ?? []).map((t) => {
                const cd = countdown(t.expiresAt);
                void now;
                return (
                  <div key={t.id} className="rounded-md border border-border p-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{t.symbol}</span>
                      <Badge variant={t.direction === "up" ? "up" : "down"}>
                        {t.direction === "up" ? "UP" : "DOWN"}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between gap-2">
                      <span className="text-xs text-muted-foreground">Mốc giá</span>
                      <span className="font-mono text-base tabular text-foreground">
                        {priceFmt(t.entryPrice, t.decimals)}
                      </span>
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                      <span>Hiện tại</span>
                      <span className="font-mono text-foreground">{priceFmt(livePrice, liveDecimals)}</span>
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                      <span>{vnd(t.amount)}</span>
                      {t.status === "running" ? (
                        <span className="font-mono text-foreground">{cd.label}</span>
                      ) : (
                        <span className={t.status === "win" ? "text-up" : "text-down"}>
                          {t.status === "win" ? "LÃI" : t.status === "refund" ? "HÒA" : "LỖ"}{" "}
                          {t.profit != null ? vnd(t.profit) : ""}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={Boolean(pending)} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận lệnh</DialogTitle>
          </DialogHeader>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tài sản</dt>
              <dd>{market?.asset.symbol}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Hướng</dt>
              <dd className={pending === "up" ? "text-up" : "text-down"}>{pending === "up" ? "MUA / UP" : "BÁN / DOWN"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Mốc giá đặt lệnh</dt>
              <dd className="font-mono">{priceFmt(freezePrice || livePrice, liveDecimals)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Số tiền</dt>
              <dd className="font-mono">{vnd(amt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Thời gian</dt>
              <dd>{expiry}s</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Payout</dt>
              <dd>{payout}%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Có thể nhận</dt>
              <dd className="font-mono text-up">{vnd(receive)}</dd>
            </div>
          </dl>
          <Button className="mt-3 w-full" variant={pending === "up" ? "up" : "down"} onClick={() => void confirm()}>
            Xác nhận đặt lệnh
          </Button>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}