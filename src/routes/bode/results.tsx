import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { countdown, priceFmt, vnd } from "@/lib/format";
import { forceCandle, getAdminMarket, setUpRatio } from "@/lib/server/market";

export const Route = createFileRoute("/bode/results")({ component: Results });

function Results() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getAdminMarket>> | null>(null);
  const [now, setNow] = useState(Date.now());
  const load = useCallback(() => {
    getAdminMarket().then(setData).catch((e) => toast.error(e instanceof Error ? e.message : "Lỗi"));
  }, []);
  useEffect(() => {
    load();
    const t = setInterval(load, 1500);
    const n = setInterval(() => setNow(Date.now()), 250);
    return () => {
      clearInterval(t);
      clearInterval(n);
    };
  }, [load]);

  async function force(id: number, dir: "up" | "down") {
    try {
      await forceCandle({ data: { assetId: id, direction: dir, timeframe: 15 } });
      toast.success(`Đã gài nến ${dir.toUpperCase()}`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    }
  }

  return (
    <AdminShell>
      <h1 className="mb-1 text-xl font-semibold">Chỉnh kết quả nến</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Tỉ lệ thắng/thua của user theo chu kỳ 10 lệnh. Ví dụ 30% = 3 thắng / 7 thua. Nến sẽ đi cùng hướng lệnh khi user thắng, ngược hướng khi user thua.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {(data?.assets ?? []).map((a) => {
          const book = (data?.running ?? []).filter((t) => t.assetId === a.id);
          const upAmt = book.filter((t) => t.direction === "up").reduce((s, t) => s + t.amount, 0);
          const downAmt = book.filter((t) => t.direction === "down").reduce((s, t) => s + t.amount, 0);
          return (
            <div key={a.id} className="rounded-xl border border-border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{a.symbol}</div>
                  <div className="font-mono text-sm tabular">{priceFmt(a.price, a.decimals)}</div>
                </div>
                {a.paused && <Badge variant="warn">Tạm dừng</Badge>}
              </div>
              <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                <span>UP {vnd(upAmt)}</span>
                <span>DOWN {vnd(downAmt)}</span>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs">
                  <span>Tỉ lệ thắng user / 10 lệnh</span>
                  <span className="font-medium text-foreground">
                    {a.upRatio}% · {Math.round(a.upRatio / 10)} thắng / {10 - Math.round(a.upRatio / 10)} thua
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={10}
                  value={a.upRatio}
                  className="w-full"
                  onChange={(e) => {
                    const v = Number(e.currentTarget.value);
                    setData((prev) =>
                      prev
                        ? { ...prev, assets: prev.assets.map((x) => (x.id === a.id ? { ...x, upRatio: v } : x)) }
                        : prev,
                    );
                  }}
                  onPointerUp={(e) => {
                    const v = Number((e.currentTarget as HTMLInputElement).value);
                    setUpRatio({ data: { assetId: a.id, upRatio: v } }).then(load).catch(() => {});
                  }}
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="up" onClick={() => void force(a.id, "up")}>
                  Ép LÊN
                </Button>
                <Button variant="down" onClick={() => void force(a.id, "down")}>
                  Ép XUỐNG
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      <h2 className="mt-8 mb-3 text-sm font-medium">Lệnh đang chạy</h2>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs text-muted-foreground">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">User</th>
              <th className="p-2">Tài sản</th>
              <th className="p-2">Hướng</th>
              <th className="p-2">Mốc giá</th>
              <th className="p-2">Tiền</th>
              <th className="p-2">Chu kỳ</th>
              <th className="p-2">Kết quả</th>
              <th className="p-2">Còn lại</th>
            </tr>
          </thead>
          <tbody>
            {(data?.running ?? []).map((t) => (
              <tr key={t.id} className="border-t border-border">
                <td className="p-2 font-mono">{t.id}</td>
                <td className="p-2 font-mono text-xs">{t.email}</td>
                <td className="p-2">{data?.assets.find((a) => a.id === t.assetId)?.symbol}</td>
                <td className="p-2">
                  <Badge variant={t.direction === "up" ? "up" : "down"}>{t.direction.toUpperCase()}</Badge>
                </td>
                <td className="p-2 font-mono">{priceFmt(t.entryPrice, data?.assets.find((a) => a.id === t.assetId)?.decimals ?? 2)}</td>
                <td className="p-2 font-mono">{vnd(t.amount)}</td>
                <td className="p-2 text-xs text-muted-foreground">{t.cycleSlot}/10</td>
                <td className="p-2">
                  <Badge variant={t.expectWin ? "up" : "down"}>{t.expectWin ? "THẮNG" : "THUA"}</Badge>
                </td>
                <td className="p-2 font-mono">{countdown(t.expiresAt).label}{void now}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
