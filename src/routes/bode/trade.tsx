import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { priceFmt, vnd } from "@/lib/format";
import { listAssetsAdmin, listTradesAdmin, saveAsset, toggleAsset, toggleTf } from "@/lib/server/admin";

export const Route = createFileRoute("/bode/trade")({ component: TradeAdmin });

function TradeAdmin() {
  const [data, setData] = useState<Awaited<ReturnType<typeof listAssetsAdmin>> | null>(null);
  const [hist, setHist] = useState<Awaited<ReturnType<typeof listTradesAdmin>> | null>(null);
  const [form, setForm] = useState({ symbol: "", name: "", basePrice: 100, decimals: 2, payout: 85, upRatio: 50, tradeStart: "", tradeEnd: "" });
  function load() {
    listAssetsAdmin().then(setData).catch((e) => toast.error(String(e)));
    listTradesAdmin({ data: { page: 1 } }).then(setHist).catch(() => {});
  }
  useEffect(() => { load(); }, []);
  return (
    <AdminShell>
      <h1 className="mb-4 text-xl font-semibold">Trade</h1>
      <Tabs defaultValue="assets">
        <TabsList>
          <TabsTrigger value="assets">Tài sản</TabsTrigger>
          <TabsTrigger value="market">Thị trường</TabsTrigger>
          <TabsTrigger value="payout">Payout / khung</TabsTrigger>
          <TabsTrigger value="hist">Lịch sử</TabsTrigger>
        </TabsList>
        <TabsContent value="assets" className="mt-4 space-y-3">
          {(data?.assets ?? []).map((a) => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3 text-sm">
              <div>
                <div className="font-medium">{a.symbol} · {a.name}</div>
                <div className="text-xs text-muted-foreground">{priceFmt(a.price, a.decimals)} · payout {a.payout}%</div>
              </div>
              <div className="flex gap-1">
                <Badge variant={a.isActive ? "up" : "outline"}>{a.isActive ? "Bật" : "Tắt"}</Badge>
                {a.paused && <Badge variant="warn">Pause</Badge>}
                <Button size="sm" variant="outline" onClick={() => toggleAsset({ data: { id: a.id, field: "active" } }).then(load)}>Bật/tắt</Button>
                <Button size="sm" variant="outline" onClick={() => toggleAsset({ data: { id: a.id, field: "paused" } }).then(load)}>Pause</Button>
                <Button size="sm" variant="ghost" onClick={() => toggleAsset({ data: { id: a.id, field: "delete" } }).then(load)}>Xóa</Button>
              </div>
            </div>
          ))}
          <div className="grid gap-2 rounded-xl border border-border p-4 sm:grid-cols-2">
            <Input placeholder="Mã (BTCUSD)" value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })} />
            <Input placeholder="Tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Giá gốc" type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })} />
            <Input placeholder="Payout %" type="number" value={form.payout} onChange={(e) => setForm({ ...form, payout: Number(e.target.value) })} />
            <Button onClick={() => saveAsset({ data: { ...form, tradeStart: form.tradeStart || null, tradeEnd: form.tradeEnd || null } }).then(() => { toast.success("Đã lưu"); load(); })}>Thêm tài sản</Button>
          </div>
        </TabsContent>
        <TabsContent value="market" className="mt-4 space-y-2">
          {(data?.assets ?? []).map((a) => (
            <div key={a.id} className="flex justify-between rounded-xl border border-border p-3 text-sm">
              <span>{a.symbol}</span>
              <span className="font-mono">{priceFmt(a.price, a.decimals)}</span>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="payout" className="mt-4 space-y-4">
          {(data?.assets ?? []).map((a) => (
            <form
              key={a.id}
              className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                saveAsset({
                  data: {
                    id: a.id,
                    symbol: a.symbol,
                    name: a.name,
                    basePrice: a.basePrice,
                    decimals: a.decimals,
                    payout: Number(fd.get("payout")),
                    upRatio: a.upRatio,
                    tradeStart: String(fd.get("start") || "") || null,
                    tradeEnd: String(fd.get("end") || "") || null,
                  },
                }).then(() => { toast.success("Đã lưu"); load(); });
              }}
            >
              <div className="sm:col-span-4 font-medium">{a.symbol}</div>
              <Input name="payout" defaultValue={a.payout} type="number" />
              <Input name="start" defaultValue={a.tradeStart ?? ""} placeholder="HH:MM bắt đầu" />
              <Input name="end" defaultValue={a.tradeEnd ?? ""} placeholder="HH:MM kết thúc" />
              <Button type="submit" size="sm">Lưu</Button>
            </form>
          ))}
          <div>
            <h3 className="mb-2 text-sm">Timeframe</h3>
            <div className="flex flex-wrap gap-2">
              {(data?.timeframes ?? []).map((t) => (
                <Button key={t.id} size="sm" variant={t.is_active ? "default" : "outline"} onClick={() => toggleTf({ data: { kind: "tf", id: t.id } }).then(load)}>
                  {t.label}
                </Button>
              ))}
            </div>
            <h3 className="mt-4 mb-2 text-sm">Expiry</h3>
            <div className="flex flex-wrap gap-2">
              {(data?.expiries ?? []).map((t) => (
                <Button key={t.id} size="sm" variant={t.is_active ? "default" : "outline"} onClick={() => toggleTf({ data: { kind: "exp", id: t.id } }).then(load)}>
                  {t.label}
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="hist" className="mt-4">
          <div className="divide-y divide-border rounded-xl border border-border text-sm">
            {(hist?.rows ?? []).map((r) => (
              <div key={r.id} className="flex justify-between p-3">
                <span>{r.email} · {r.symbol} {r.direction}</span>
                <span>{vnd(r.amount)} {r.status}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </AdminShell>
  );
}
