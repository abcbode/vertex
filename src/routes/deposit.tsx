import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STATUS_LABEL, vnd, vietQrUrl } from "@/lib/format";
import { createDeposit, getDepositInfo, listDeposits } from "@/lib/server/user";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/deposit")({ component: DepositPage });

function statusVariant(s: string) {
  if (s === "approved") return "up" as const;
  if (s === "rejected") return "down" as const;
  return "warn" as const;
}

function DepositPage() {
  const [info, setInfo] = useState<Awaited<ReturnType<typeof getDepositInfo>> | null>(null);
  const [hist, setHist] = useState<Awaited<ReturnType<typeof listDeposits>> | null>(null);
  const [amount, setAmount] = useState("500000");
  const [bankId, setBankId] = useState<number | null>(null);
  const [created, setCreated] = useState<{ id: number; content: string; amount: number } | null>(null);

  useEffect(() => {
    getDepositInfo().then((i) => {
      setInfo(i);
      setBankId(i.banks[0]?.id ?? null);
    }).catch(() => {});
    listDeposits({ data: { page: 1 } }).then(setHist).catch(() => {});
  }, []);

  const bank = info?.banks.find((b) => b.id === bankId) ?? info?.banks[0];
  const customQr = info?.qrs.find((q) => q.bankAccountId === bank?.id && q.imageUrl)?.imageUrl;
  const amt = Number(amount) || 0;
  const content = created?.content ?? `${info?.prefix ?? "VERTEX"}${info?.userCode ?? ""}`;
  const qr = useMemo(() => {
    if (customQr) return customQr;
    if (!bank?.bankCode) return "";
    return vietQrUrl({
      bankCode: bank.bankCode,
      accountNumber: bank.accountNumber,
      accountName: bank.accountName,
      amount: created?.amount ?? amt,
      addInfo: content,
    });
  }, [bank, amt, content, customQr, created]);

  async function submit() {
    if (!bank) return;
    try {
      const res = await createDeposit({ data: { amount: amt, bankAccountId: bank.id } });
      setCreated({ id: res.id, content: res.content, amount: amt });
      toast.success("Đã tạo yêu cầu nạp");
      listDeposits({ data: { page: 1 } }).then(setHist).catch(() => {});
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-xl space-y-4 p-4">
        <h1 className="text-xl font-semibold">Nạp tiền</h1>
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="space-y-1.5">
            <Label>Số tiền nạp</Label>
            <Input value={amount} inputMode="numeric" onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))} />
            <p className="text-xs text-muted-foreground">Tối thiểu {vnd(info?.min ?? 50000)}</p>
          </div>
          <div className="space-y-1.5">
            <Label>Tài khoản nhận</Label>
            <div className="flex flex-col gap-2">
              {(info?.banks ?? []).map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBankId(b.id)}
                  className={cn(
                    "rounded-md border border-border p-3 text-left text-sm",
                    bankId === b.id && "border-ring",
                  )}
                >
                  <div className="font-medium">{b.bankName}</div>
                  <div className="font-mono text-xs">{b.accountNumber}</div>
                  <div className="text-xs text-muted-foreground">{b.accountName}</div>
                </button>
              ))}
            </div>
          </div>
          {bank && (
            <div className="rounded-md bg-muted p-3 text-sm space-y-1">
              <div>Ngân hàng: {bank.bankName}</div>
              <div>STK: <span className="font-mono">{bank.accountNumber}</span></div>
              <div>Chủ TK: {bank.accountName}</div>
              <div>Nội dung: <span className="font-mono">{content}</span></div>
            </div>
          )}
          {qr && (
            <div className="flex flex-col items-center gap-2">
              <img src={qr} alt="QR nạp tiền" className="size-48 rounded-md bg-primary" />
              <p className="text-xs text-muted-foreground">Quét QR hoặc chuyển khoản đúng nội dung</p>
            </div>
          )}
          <Button className="w-full" onClick={() => void submit()}>
            Tạo yêu cầu nạp
          </Button>
        </div>
        <h2 className="text-sm font-medium text-muted-foreground">Lịch sử nạp</h2>
        <div className="divide-y divide-border rounded-xl border border-border">
          {(hist?.rows ?? []).map((r) => (
            <div key={r.id} className="flex items-center justify-between p-3 text-sm">
              <div>
                <div className="font-mono">{vnd(r.amount)}</div>
                <div className="text-xs text-muted-foreground">{r.content}</div>
              </div>
              <Badge variant={statusVariant(r.status)}>{STATUS_LABEL[r.status] ?? r.status}</Badge>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
