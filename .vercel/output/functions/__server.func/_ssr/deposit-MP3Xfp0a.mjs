import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { l as vietQrUrl, t as STATUS_LABEL, u as vnd } from "./format-Bc8Vy2YH.mjs";
import { r as cn, t as Button } from "./button-BllcHIJj.mjs";
import { a as getDepositInfo, r as createDeposit, s as listDeposits } from "./user-EfFR6VyT.mjs";
import { t as AppShell } from "./app-shell-D1i_Vq6F.mjs";
import { t as Input } from "./input-CRLCFB24.mjs";
import { t as Label } from "./label-B2aHMkv2.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Badge } from "./badge-fhx-I2rq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/deposit-MP3Xfp0a.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function statusVariant(s) {
	if (s === "approved") return "up";
	if (s === "rejected") return "down";
	return "warn";
}
function DepositPage() {
	const [info, setInfo] = (0, import_react.useState)(null);
	const [hist, setHist] = (0, import_react.useState)(null);
	const [amount, setAmount] = (0, import_react.useState)("500000");
	const [bankId, setBankId] = (0, import_react.useState)(null);
	const [created, setCreated] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
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
	const qr = (0, import_react.useMemo)(() => {
		if (customQr) return customQr;
		if (!bank?.bankCode) return "";
		return vietQrUrl({
			bankCode: bank.bankCode,
			accountNumber: bank.accountNumber,
			accountName: bank.accountName,
			amount: created?.amount ?? amt,
			addInfo: content
		});
	}, [
		bank,
		amt,
		content,
		customQr,
		created
	]);
	async function submit() {
		if (!bank) return;
		try {
			const res = await createDeposit({ data: {
				amount: amt,
				bankAccountId: bank.id
			} });
			setCreated({
				id: res.id,
				content: res.content,
				amount: amt
			});
			toast.success("Đã tạo yêu cầu nạp");
			listDeposits({ data: { page: 1 } }).then(setHist).catch(() => {});
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Lỗi");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl space-y-4 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-xl font-semibold",
				children: "Nạp tiền"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-border bg-card p-4 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Số tiền nạp" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: amount,
								inputMode: "numeric",
								onChange: (e) => setAmount(e.target.value.replace(/[^\d]/g, ""))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: ["Tối thiểu ", vnd(info?.min ?? 5e4)]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Tài khoản nhận" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-col gap-2",
							children: (info?.banks ?? []).map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setBankId(b.id),
								className: cn("rounded-md border border-border p-3 text-left text-sm", bankId === b.id && "border-ring"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-medium",
										children: b.bankName
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-mono text-xs",
										children: b.accountNumber
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted-foreground",
										children: b.accountName
									})
								]
							}, b.id))
						})]
					}),
					bank && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-md bg-muted p-3 text-sm space-y-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Ngân hàng: ", bank.bankName] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["STK: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono",
								children: bank.accountNumber
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Chủ TK: ", bank.accountName] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Nội dung: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono",
								children: content
							})] })
						]
					}),
					qr && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: qr,
							alt: "QR nạp tiền",
							className: "size-48 rounded-md bg-primary"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Quét QR hoặc chuyển khoản đúng nội dung"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						onClick: () => void submit(),
						children: "Tạo yêu cầu nạp"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium text-muted-foreground",
				children: "Lịch sử nạp"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "divide-y divide-border rounded-xl border border-border",
				children: (hist?.rows ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between p-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono",
						children: vnd(r.amount)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: r.content
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
export { DepositPage as component };
