import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { u as vnd } from "./format-Bc8Vy2YH.mjs";
import { a as getDashboard } from "./admin-Bp8V99lv.mjs";
import { t as AdminShell } from "./admin-shell-5m9sW_mQ.mjs";
import { n as CardContent, t as Card } from "./card-BKV4ShhV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-DNpBiNqz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Stat({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `mt-1 font-mono text-xl tabular ${tone ?? ""}`,
			children: value
		})]
	}) });
}
function Dash() {
	const [d, setD] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		getDashboard({ data: { range: "all" } }).then(setD).catch(() => {});
	}, []);
	const max = Math.max(1, ...d?.series.map((s) => Math.max(s.deposit, s.withdraw, s.volume)) ?? [1]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mb-4 text-xl font-semibold",
			children: "Dashboard"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Tổng user",
					value: String(d?.users.total ?? 0)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "User mới (24h)",
					value: String(d?.users.neu ?? 0)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Đang hoạt động",
					value: String(d?.users.active ?? 0)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Bị khóa",
					value: String(d?.users.locked ?? 0)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Tổng nạp",
					value: vnd(d?.totalDeposit ?? 0)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Tổng rút",
					value: vnd(d?.totalWithdraw ?? 0)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Volume trade",
					value: vnd(d?.volume ?? 0)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "P/L hệ thống",
					value: vnd(d?.pnl ?? 0),
					tone: (d?.pnl ?? 0) >= 0 ? "text-up" : "text-down"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Tiền thắng (user)",
					value: vnd(d?.totalWin ?? 0),
					tone: "text-up"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Tiền thua (user)",
					value: vnd(d?.totalLoss ?? 0),
					tone: "text-down"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Nạp hôm nay",
					value: vnd(d?.depositToday ?? 0)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Rút hôm nay",
					value: vnd(d?.withdrawToday ?? 0)
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-8 mb-3 text-sm font-medium text-muted-foreground",
			children: "14 ngày gần nhất"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex h-40 items-end gap-1 rounded-xl border border-border p-3",
			children: (d?.series ?? []).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col items-center gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-28 w-full items-end justify-center gap-px",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-1/3 bg-steel/80",
							style: { height: `${s.deposit / max * 100}%` }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-1/3 bg-down/70",
							style: { height: `${s.withdraw / max * 100}%` }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-1/3 bg-up/70",
							style: { height: `${s.volume / max * 100}%` }
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[9px] text-muted-foreground",
					children: s.date.slice(5)
				})]
			}, s.date))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs text-muted-foreground",
			children: "Cột: nạp / rút / volume"
		})
	] });
}
//#endregion
export { Dash as component };
