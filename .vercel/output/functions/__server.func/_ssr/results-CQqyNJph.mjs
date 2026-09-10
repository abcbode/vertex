import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as countdown, s as priceFmt, u as vnd } from "./format-Bc8Vy2YH.mjs";
import { t as Button } from "./button-BllcHIJj.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as AdminShell } from "./admin-shell-5m9sW_mQ.mjs";
import { t as Badge } from "./badge-fhx-I2rq.mjs";
import { a as setUpRatio, n as getAdminMarket, t as forceCandle } from "./market-ChV-qq7k.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/results-CQqyNJph.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Results() {
	const [data, setData] = (0, import_react.useState)(null);
	const [now, setNow] = (0, import_react.useState)(Date.now());
	const load = (0, import_react.useCallback)(() => {
		getAdminMarket().then(setData).catch((e) => toast.error(e instanceof Error ? e.message : "Lỗi"));
	}, []);
	(0, import_react.useEffect)(() => {
		load();
		const t = setInterval(load, 1500);
		const n = setInterval(() => setNow(Date.now()), 250);
		return () => {
			clearInterval(t);
			clearInterval(n);
		};
	}, [load]);
	async function force(id, dir) {
		try {
			await forceCandle({ data: {
				assetId: id,
				direction: dir,
				timeframe: 15
			} });
			toast.success(`Đã gài nến ${dir.toUpperCase()}`);
			load();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Lỗi");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mb-1 text-xl font-semibold",
			children: "Chỉnh kết quả nến"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-4 text-sm text-muted-foreground",
			children: "Tỉ lệ thắng/thua của user theo chu kỳ 10 lệnh. Ví dụ 30% = 3 thắng / 7 thua. Nến sẽ đi cùng hướng lệnh khi user thắng, ngược hướng khi user thua."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 md:grid-cols-2",
			children: (data?.assets ?? []).map((a) => {
				const book = (data?.running ?? []).filter((t) => t.assetId === a.id);
				const upAmt = book.filter((t) => t.direction === "up").reduce((s, t) => s + t.amount, 0);
				const downAmt = book.filter((t) => t.direction === "down").reduce((s, t) => s + t.amount, 0);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-medium",
								children: a.symbol
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-sm tabular",
								children: priceFmt(a.price, a.decimals)
							})] }), a.paused && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "warn",
								children: "Tạm dừng"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex justify-between text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["UP ", vnd(upAmt)] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["DOWN ", vnd(downAmt)] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-1 flex justify-between text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tỉ lệ thắng user / 10 lệnh" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-medium text-foreground",
									children: [
										a.upRatio,
										"% · ",
										Math.round(a.upRatio / 10),
										" thắng / ",
										10 - Math.round(a.upRatio / 10),
										" thua"
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: 0,
								max: 100,
								step: 10,
								value: a.upRatio,
								className: "w-full",
								onChange: (e) => {
									const v = Number(e.currentTarget.value);
									setData((prev) => prev ? {
										...prev,
										assets: prev.assets.map((x) => x.id === a.id ? {
											...x,
											upRatio: v
										} : x)
									} : prev);
								},
								onPointerUp: (e) => {
									const v = Number(e.currentTarget.value);
									setUpRatio({ data: {
										assetId: a.id,
										upRatio: v
									} }).then(load).catch(() => {});
								}
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "up",
								onClick: () => void force(a.id, "up"),
								children: "Ép LÊN"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "down",
								onClick: () => void force(a.id, "down"),
								children: "Ép XUỐNG"
							})]
						})
					]
				}, a.id);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-8 mb-3 text-sm font-medium",
			children: "Lệnh đang chạy"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto rounded-xl border border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-muted text-left text-xs text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "p-2",
							children: "ID"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "p-2",
							children: "User"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "p-2",
							children: "Tài sản"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "p-2",
							children: "Hướng"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "p-2",
							children: "Mốc giá"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "p-2",
							children: "Tiền"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "p-2",
							children: "Chu kỳ"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "p-2",
							children: "Kết quả"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "p-2",
							children: "Còn lại"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: (data?.running ?? []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-2 font-mono",
							children: t.id
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-2 font-mono text-xs",
							children: t.email
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-2",
							children: data?.assets.find((a) => a.id === t.assetId)?.symbol
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: t.direction === "up" ? "up" : "down",
								children: t.direction.toUpperCase()
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-2 font-mono",
							children: priceFmt(t.entryPrice, data?.assets.find((a) => a.id === t.assetId)?.decimals ?? 2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-2 font-mono",
							children: vnd(t.amount)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "p-2 text-xs text-muted-foreground",
							children: [t.cycleSlot, "/10"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: t.expectWin ? "up" : "down",
								children: t.expectWin ? "THẮNG" : "THUA"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "p-2 font-mono",
							children: [countdown(t.expiresAt).label, void 0]
						})
					]
				}, t.id)) })]
			})
		})
	] });
}
//#endregion
export { Results as component };
