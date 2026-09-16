import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, CandlestickChart, Shield, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { priceFmt, vnd } from "@/lib/format";
import { getBootstrap } from "@/lib/server/core";
import { getPublicTicker, type AssetPublic } from "@/lib/server/market";
import { listMyTrades } from "@/lib/server/trade";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { user } = useCurrentUserState();
  if (user) {
    return (
      <AppShell>
        <Dashboard />
      </AppShell>
    );
  }
  return <Landing />;
}

function Ticker({ assets }: { assets: AssetPublic[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {assets.map((a) => {
        const up = a.change >= 0;
        return (
          <Link key={a.id} to="/trade" search={{ asset: a.id }}>
            <Card className="transition-colors hover:border-ring">
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div>
                  <div className="font-medium">{a.symbol}</div>
                  <div className="text-xs text-muted-foreground">{a.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm tabular">{priceFmt(a.price, a.decimals)}</div>
                  <div className={cn("text-xs", up ? "text-up" : "text-down")}>
                    {up ? "+" : ""}
                    {a.change.toFixed(2)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

function Landing() {
  const [assets, setAssets] = useState<AssetPublic[]>([]);
  useEffect(() => {
    getPublicTicker().then(setAssets).catch(() => {});
    const t = setInterval(() => getPublicTicker().then(setAssets).catch(() => {}), 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <AppShell requireAuth={false}>
      <section className="relative overflow-hidden px-4 py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0 surface-grid opacity-60" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium tracking-[0.2em] text-steel uppercase">Sàn Binary Options</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
            Đọc nến. Đặt lệnh. Kết thúc trong giây.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            VERTEX là bàn giao dịch UP / DOWN với nến realtime, nạp rút ngân hàng Việt Nam và ví rõ ràng.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/register">Mở tài khoản</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/login">Đăng nhập</Link>
            </Button>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">Thị trường</h2>
        <Ticker assets={assets} />
        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {[
            { icon: CandlestickChart, t: "Nến realtime", d: "Khung 5s đến 5 phút, giá OHLC luôn hiện." },
            { icon: Wallet, t: "Nạp rút ngân hàng", d: "QR VietQR, nội dung chuyển khoản, duyệt trạng thái." },
            { icon: Shield, t: "CSKH 24/7", d: "Telegram, Zalo, Messenger — một chạm." },
          ].map((x) => (
            <Card key={x.t}>
              <CardContent className="p-5">
                <x.icon className="size-5 text-steel" />
                <h3 className="mt-3 font-medium">{x.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{x.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function Dashboard() {
  const [assets, setAssets] = useState<AssetPublic[]>([]);
  const [bal, setBal] = useState(0);
  const [stats, setStats] = useState({ win: 0, loss: 0 });
  useEffect(() => {
    getPublicTicker().then(setAssets).catch(() => {});
    getBootstrap().then((b) => setBal(b.wallet.balance)).catch(() => {});
    listMyTrades({ data: { page: 1 } })
      .then((t) => setStats({ win: t.win, loss: t.loss }))
      .catch(() => {});
    const t = setInterval(() => getPublicTicker().then(setAssets).catch(() => {}), 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Số dư</div>
            <div className="mt-1 font-mono text-2xl tabular">{vnd(bal)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-1 text-xs text-up">
              <ArrowUpRight className="size-3" /> Tổng lãi
            </div>
            <div className="mt-1 font-mono text-2xl tabular text-up">{vnd(stats.win)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-1 text-xs text-down">
              <ArrowDownRight className="size-3" /> Tổng lỗ
            </div>
            <div className="mt-1 font-mono text-2xl tabular text-down">{vnd(stats.loss)}</div>
          </CardContent>
        </Card>
      </div>
      <div className="flex gap-2">
        <Button asChild>
          <Link to="/trade">Giao dịch</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/deposit">Nạp tiền</Link>
        </Button>
      </div>
      <Ticker assets={assets} />
    </div>
  );
}
