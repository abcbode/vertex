import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { r as VN_BANKS, t as STATUS_LABEL, u as vnd } from "./format-Bc8Vy2YH.mjs";
import { r as cn, t as Button } from "./button-BllcHIJj.mjs";
import { d as listWithdrawals, i as createWithdraw, o as getWallet, t as addUserBank, u as listUserBanks } from "./user-EfFR6VyT.mjs";
import { t as AppShell } from "./app-shell-D1i_Vq6F.mjs";
import { t as Input } from "./input-CRLCFB24.mjs";
import { t as Label } from "./label-B2aHMkv2.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Badge } from "./badge-fhx-I2rq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/withdraw-DRifE9SZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function statusVariant(s) {
	if (s === "paid" || s === "approved") return "up";
	if (s === "rejected") return "down";
	return "warn";
}
function WithdrawPage() {
	const [banks, setBanks] = (0, import_react.useState)([]);
	const [hist, setHist] = (0, import_react.useState)(null);
	const [bal, setBal] = (0, import_react.useState)(0);
	const [amount, setAmount] = (0, import_react.useState)("200000");
	const [bankId, setBankId] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)({
		bankName: "Vietcombank",
		bankCode: "970436",
		accountNumber: "",
		accountName: ""
	});
	function reload() {
		listUserBanks().then((b) => {
			setBanks(b);
			setBankId((id) => id ?? b[0]?.id ?? null);
		}).catch(() => {});
		listWithdrawals({ data: { page: 1 } }).then(setHist).catch(() => {});
		getWallet().then((w) => setBal(w.wallet.balance)).catch(() => {});
	}
	(0, import_react.useEffect)(() => {
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
			await createWithdraw({ data: {
				amount: Number(amount),
				bankId
			} });
			toast.success("Đã gửi yêu cầu rút");
			reload();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Lỗi");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl space-y-4 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-xl font-semibold",
				children: "Rút tiền"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: ["Số dư khả dụng ", vnd(bal)]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-border bg-card p-4 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Số tiền cần rút" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: amount,
							inputMode: "numeric",
							onChange: (e) => setAmount(e.target.value.replace(/[^\d]/g, ""))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Tài khoản nhận" }), banks.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setBankId(b.id),
							className: cn("w-full rounded-md border border-border p-3 text-left text-sm", bankId === b.id && "border-ring"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: b.bankName }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-mono text-xs",
								children: [
									b.accountNumber,
									" · ",
									b.accountName
								]
							})]
						}, b.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						onClick: () => void submit(),
						children: "Tạo yêu cầu rút"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-border bg-card p-4 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Thêm tài khoản ngân hàng"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "h-11 w-full rounded-md border border-input bg-background px-3 text-sm",
						value: form.bankCode,
						onChange: (e) => {
							const b = VN_BANKS.find((x) => x.code === e.target.value);
							setForm({
								...form,
								bankCode: e.target.value,
								bankName: b?.name ?? form.bankName
							});
						},
						children: VN_BANKS.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: b.code,
							children: b.name
						}, b.code))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Số tài khoản",
						value: form.accountNumber,
						onChange: (e) => setForm({
							...form,
							accountNumber: e.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Tên chủ tài khoản",
						value: form.accountName,
						onChange: (e) => setForm({
							...form,
							accountName: e.target.value.toUpperCase()
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "w-full",
						onClick: () => void addBank(),
						children: "Lưu tài khoản"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium text-muted-foreground",
				children: "Lịch sử rút"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "divide-y divide-border rounded-xl border border-border",
				children: (hist?.rows ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between p-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono",
						children: vnd(r.amount)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted-foreground",
						children: [
							r.bankName,
							" ",
							r.accountNumber
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: statusVariant(r.status),
						children: STATUS_LABEL[r.status] ?? r.status
					})]
				}, r.id))
			})
		]
	}) });
}
//#endregion
export { WithdrawPage as component };
