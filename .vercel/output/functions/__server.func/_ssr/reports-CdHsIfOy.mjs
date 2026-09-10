import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { u as vnd } from "./format-Bc8Vy2YH.mjs";
import { a as getDashboard, c as listActivity } from "./admin-Bp8V99lv.mjs";
import { t as AdminShell } from "./admin-shell-5m9sW_mQ.mjs";
import { n as CardContent, t as Card } from "./card-BKV4ShhV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-CdHsIfOy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Reports() {
	const [d, setD] = (0, import_react.useState)(null);
	const [logs, setLogs] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		getDashboard({ data: { range: "month" } }).then(setD).catch(() => {});
		listActivity({ data: { page: 1 } }).then(setLogs).catch(() => {});
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mb-4 text-xl font-semibold",
			children: "Báo cáo"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: "Volume"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-xl",
						children: vnd(d?.volume ?? 0)
					})]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: "UP / DOWN"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "font-mono text-xl",
						children: [
							d?.upCount ?? 0,
							" / ",
							d?.downCount ?? 0
						]
					})]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: "WIN / LOSS"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "font-mono text-xl",
						children: [
							d?.winCount ?? 0,
							" / ",
							d?.lossCount ?? 0
						]
					})]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: "P/L hệ thống"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-xl",
						children: vnd(d?.pnl ?? 0)
					})]
				}) })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-8 mb-2 text-sm font-medium",
			children: "Nhật ký hoạt động"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "divide-y divide-border rounded-xl border border-border text-sm",
			children: logs.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						l.role,
						" · ",
						l.action
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: new Date(l.createdAt).toLocaleString("vi-VN")
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted-foreground",
					children: l.detail
				})]
			}, l.id))
		})
	] });
}
//#endregion
export { Reports as component };
