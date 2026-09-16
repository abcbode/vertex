import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STATUS_LABEL, VN_BANKS, vnd } from "@/lib/format";
import { addUserBank, createWithdraw, getWallet, listUserBanks, listWithdrawals } from "@/lib/server/user";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/withdraw")({ component: WithdrawPage });

function statusVariant(s: string) {
  if (s === "paid" || s === "approved") return "up" as const;
  if (s === "rejected") return "down" as const;
  return "warn" as const;
}

function WithdrawPage() {
  const [banks, setBanks] = useState<Awaited<ReturnType<typeof listUserBanks>>>([]);
  const [hist, setHist] = useState<Awaited<ReturnType<typeof listWithdrawals>> | null>(null);
  const [bal, setBal] = useState(0);
  const [amount, setAmount] = useState("200000");
  const [bankId, setBankId] = useState<number | null>(null);
  const [form, setForm] = useState({ bankName: "Vietcombank", bankCode: "970436", accountNumber: "", accountName: "" });

  function reload() {
    listUserBanks().then((b) => {
      setBanks(b);
      setBankId((id) => id ?? b[0]?.id ?? null);
    }).catch(() => {});
    listWithdrawals({ data: { page: 1 } }).then(setHist).catch(() => {});
    getWallet().then((w) => setBal(w.wallet.balance)).catch(() => {});
  }
  useEffect(() => {
    reload();
  }, []);

  async function addBank() {
    try {
      await addUserBank({ data: form });
      toast.success("Đã thêm tài khoản");
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    }
  }

  async function submit() {
    if (!bankId) {
      toast.error("Thêm tài khoản ngân hàng trước");
      return;
    }
    try {
      await createWithdraw({ data: { amount: Number(amount), bankId } });
      toast.success("Đã gửi yêu cầu rút");
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-xl space-y-4 p-4">
        <h1 className="text-xl font-semibold">Rút tiền</h1>
        <p className="text-sm text-muted-foreground">Số dư khả dụng {vnd(bal)}</p>
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="space-y-1.5">
            <Label>Số tiền cần rút</Label>
            <Input value={amount} inputMode="numeric" onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))} />
          </div>
          <div className="space-y-1.5">
            <Label>Tài khoản nhận</Label>
            {banks.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBankId(b.id)}
                className={cn("w-full rounded-md border border-border p-3 text-left text-sm", bankId === b.id && "border-ring")}
              >
                <div>{b.bankName}</div>
                <div className="font-mono text-xs">{b.accountNumber} · {b.accountName}</div>
              </button>
            ))}
          </div>
          <Button className="w-full" onClick={() => void submit()}>
            Tạo yêu cầu rút
          </Button>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h2 className="text-sm font-medium">Thêm tài khoản ngân hàng</h2>
          <select
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={form.bankCode}
            onChange={(e) => {
              const b = VN_BANKS.find((x) => x.code === e.target.value);
              setForm({ ...form, bankCode: e.target.value, bankName: b?.name ?? form.bankName });
            }}
          >
            {VN_BANKS.map((b) => (
              <option key={b.code} value={b.code}>{b.name}</option>
            ))}
          </select>
          <Input placeholder="Số tài khoản" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} />
          <Input placeholder="Tên chủ tài khoản" value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value.toUpperCase() })} />
          <Button variant="outline" className="w-full" onClick={() => void addBank()}>
            Lưu tài khoản
          </Button>
        </div>
        <h2 className="text-sm font-medium text-muted-foreground">Lịch sử rút</h2>
        <div className="divide-y divide-border rounded-xl border border-border">
          {(hist?.rows ?? []).map((r) => (
            <div key={r.id} className="flex items-center justify-between p-3 text-sm">
              <div>
                <div className="font-mono">{vnd(r.amount)}</div>
                <div className="text-xs text-muted-foreground">{r.bankName} {r.accountNumber}</div>
              </div>
              <Badge variant={statusVariant(r.status)}>{STATUS_LABEL[r.status] ?? r.status}</Badge>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
