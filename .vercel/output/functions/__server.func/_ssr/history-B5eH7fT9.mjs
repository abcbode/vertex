import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as STATUS_LABEL, u as vnd } from "./format-Bc8Vy2YH.mjs";
import { r as cn, t as Button } from "./button-BllcHIJj.mjs";
import { t as AppShell } from "./app-shell-D1i_Vq6F.mjs";
import { t as Input } from "./input-CRLCFB24.mjs";
import { t as Badge } from "./badge-fhx-I2rq.mjs";
import { t as listMyTrades } from "./trade-C4h97FLa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/history-B5eH7fT9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function HistoryPage() {
	const [status, setStatus] = (0, import_react.useState)("all");
	const [from, setFrom] = (0, import_react.useState)("");
	const [to, setTo] = (0, import_react.useState)("");
	const [page, setPage] = (0, import_react.useState)(1);
	const [data, setData] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		listMyTrades({ data: {
			page,
			status,
			from,
			to
		} }).then(setData).catch(() => {});
	}, [
		page,
		status,
		from,
		to
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl space-y-4 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-xl font-semibold",
				children: "Lịch sử trade"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-up",
					children: [
						"Lãi ",
						vnd(data?.win ?? 0),
						" (",
						data?.winCount ?? 0,
						")"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-down",
					children: [
						"Lỗ ",
						vnd(data?.loss ?? 0),
						" (",
						data?.lossCount ?? 0,
						")"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					"all",
					"win",
					"loss",
					"running"
				].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setStatus(s);
						setPage(1);
					},
					className: cn("rounded-full border border-border px-3 py-1 text-xs", status === s && "bg-accent"),
					children: s === "all" ? "Tất cả" : STATUS_LABEL[s] ?? s
				}, s))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "date",
					value: from,
					onChange: (e) => setFrom(e.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "date",
					value: to,
					onChange: (e) => setTo(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "divide-y divide-border rounded-xl border border-border",
				children: (data?.rows ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between p-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "font-medium",
						children: [
							r.symbol,
							" · ",
							r.direction.toUpperCase()
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: new Date(r.openedAt).toLocaleString("vi-VN")
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono",
							children: vnd(r.amount)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: r.status === "win" ? "up" : r.status === "loss" ? "down" : "outline",
							children: STATUS_LABEL[r.status] ?? r.status
						})]
					})]
				}, r.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					disabled: page <= 1,
					onClick: () => setPage((p) => p - 1),
					children: "Trước"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					disabled: (data?.rows.length ?? 0) < 20,
					onClick: () => setPage((p) => p + 1),
					children: "Sau"
				})]
			})
		]
	}) });
}
//#endregion
export { HistoryPage as component };
