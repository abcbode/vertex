export function vnd(n: number | string | null | undefined): string {
  const v = Number(n ?? 0);
  if (!Number.isFinite(v)) return "0 đ";
  return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(Math.round(v))} đ`;
}

export function priceFmt(n: number | string | null | undefined, decimals = 2): string {
  const v = Number(n ?? 0);
  if (!Number.isFinite(v)) return (0).toFixed(decimals);
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(v);
}

export function pct(n: number | string | null | undefined): string {
  const v = Number(n ?? 0);
  return `${v.toFixed(0)}%`;
}

export function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function iso(v: unknown): string {
  if (!v) return "";
  if (v instanceof Date) return v.toISOString();
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? String(v) : d.toISOString();
}

export function timeAgo(isoStr: string): string {
  const t = new Date(isoStr).getTime();
  if (!Number.isFinite(t)) return "";
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (s < 60) return `${s} giây trước`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} phút trước`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.round(h / 24);
  return `${d} ngày trước`;
}

export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

export function countdown(expiresAt: string): { total: number; label: string } {
  const ms = new Date(expiresAt).getTime() - Date.now();
  const total = Math.max(0, Math.ceil(ms / 1000));
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  return { total, label: `${pad2(mm)}:${pad2(ss)}` };
}

export const VN_BANKS: { name: string; code: string }[] = [
  { name: "Vietcombank", code: "970436" },
  { name: "Techcombank", code: "970407" },
  { name: "MB Bank", code: "970422" },
  { name: "ACB", code: "970416" },
  { name: "VPBank", code: "970432" },
  { name: "BIDV", code: "970418" },
  { name: "VietinBank", code: "970415" },
  { name: "TPBank", code: "970423" },
  { name: "Sacombank", code: "970403" },
  { name: "MSB", code: "970426" },
  { name: "Agribank", code: "970405" },
  { name: "HDBank", code: "970437" },
];

export function vietQrUrl(opts: {
  bankCode: string;
  accountNumber: string;
  accountName: string;
  amount?: number;
  addInfo?: string;
}): string {
  const amount = opts.amount && opts.amount > 0 ? String(Math.round(opts.amount)) : "";
  const info = encodeURIComponent(opts.addInfo ?? "");
  const name = encodeURIComponent(opts.accountName);
  return `https://img.vietqr.io/image/${opts.bankCode}-${opts.accountNumber}-compact2.png?amount=${amount}&addInfo=${info}&accountName=${name}`;
}

export const STATUS_LABEL: Record<string, string> = {
  pending: "Chờ duyệt",
  approved: "Thành công",
  rejected: "Từ chối",
  paid: "Đã thanh toán",
  running: "Đang chạy",
  win: "Lãi",
  loss: "Lỗ",
  refund: "Hòa / hoàn tiền",
  active: "Hoạt động",
  locked: "Bị khóa",
};

export const TYPE_LABEL: Record<string, string> = {
  deposit: "Nạp tiền",
  withdraw: "Rút tiền",
  trade_hold: "Đặt lệnh",
  trade_win: "Lãi lệnh",
  trade_loss: "Lỗ lệnh",
  trade_refund: "Hoàn lệnh",
  bonus: "Thưởng",
  adjust: "Điều chỉnh",
};
