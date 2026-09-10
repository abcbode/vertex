import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TYPE_LABEL, u as vnd } from "./format-Bc8Vy2YH.mjs";
import { t as Button } from "./button-BllcHIJj.mjs";
import { c as listLedger, o as getWallet } from "./user-EfFR6VyT.mjs";
import { t as AppShell } from "./app-shell-D1i_Vq6F.mjs";
import { n as CardContent, t as Card } from "./card-BKV4ShhV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wallet-D61qqUmQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function WalletPage() {
	const [w, setW] = (0, import_react.useState)(null);
	const [led, setLed] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		getWallet().then(setW).catch(() => {});
		listLedger({ data: { page: 1 } }).then(setLed).catch(() => {});
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl space-y-4 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-xl font-semibold",
				children: "Ví tiền"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: "Số dư"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 font-mono text-xl tabular",
							children: vnd(w?.wallet.balance ?? 0)
						})]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: "Tổng đã nạp"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 font-mono text-xl tabular",
							children: vnd(w?.wallet.totalDeposit ?? 0)
						})]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: "Tổng đã rút"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 font-mono text-xl tabular",
							children: vnd(w?.wallet.totalWithdraw ?? 0)
						})]
					}) })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/deposit",
							children: "Nạp tiền"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/withdraw",
							children: "Rút tiền"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/history",
							children: "Lịch sử"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium text-muted-foreground",
				children: "Biến động số dư"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "divide-y divide-border rounded-xl border border-border",
				children: [(led?.rows ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between p-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: TYPE_LABEL[r.type] ?? r.type }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: new Date(r.createdAt).toLocaleString("vi-VN")
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: r.amount >= 0 ? "text-up" : "text-down",
							children: [r.amount >= 0 ? "+" : "", vnd(r.amount)]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: vnd(r.balanceAfter)
						})]
					})]
				}, r.id)), (led?.rows ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "p-4 text-sm text-muted-foreground",
					children: "Chưa có giao dịch."
				})]
			})
		]
	}) });
}
//#endregion
export { WalletPage as component };
