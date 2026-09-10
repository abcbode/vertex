import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { s as priceFmt, u as vnd } from "./format-Bc8Vy2YH.mjs";
import { r as cn, t as Button } from "./button-BllcHIJj.mjs";
import { t as Input } from "./input-CRLCFB24.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { O as toggleAsset, d as listAssetsAdmin, h as listTradesAdmin, j as toggleTf, x as saveAsset } from "./admin-Bp8V99lv.mjs";
import { t as AdminShell } from "./admin-shell-5m9sW_mQ.mjs";
import { t as Badge } from "./badge-fhx-I2rq.mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/trade-DYopEBHx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Tabs = Root2;
function TabsList({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
		className: cn("inline-flex h-10 items-center gap-1 rounded-lg bg-muted p-1", className),
		...props
	});
}
function TabsTrigger({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
		className: cn("inline-flex h-8 items-center rounded-md px-3 text-sm text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground", className),
		...props
	});
}
var TabsContent = Content;
function TradeAdmin() {
	const [data, setData] = (0, import_react.useState)(null);
	const [hist, setHist] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)({
		symbol: "",
		name: "",
		basePrice: 100,
		decimals: 2,
		payout: 85,
		upRatio: 50,
		tradeStart: "",
		tradeEnd: ""
	});
	function load() {
		listAssetsAdmin().then(setData).catch((e) => toast.error(String(e)));
		listTradesAdmin({ data: { page: 1 } }).then(setHist).catch(() => {});
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
		className: "mb-4 text-xl font-semibold",
		children: "Trade"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
		defaultValue: "assets",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "assets",
					children: "Tài sản"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "market",
					children: "Thị trường"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "payout",
					children: "Payout / khung"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "hist",
					children: "Lịch sử"
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
				value: "assets",
				className: "mt-4 space-y-3",
				children: [(data?.assets ?? []).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "font-medium",
						children: [
							a.symbol,
							" · ",
							a.name
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted-foreground",
						children: [
							priceFmt(a.price, a.decimals),
							" · payout ",
							a.payout,
							"%"
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: a.isActive ? "up" : "outline",
								children: a.isActive ? "Bật" : "Tắt"
							}),
							a.paused && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "warn",
								children: "Pause"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => toggleAsset({ data: {
									id: a.id,
									field: "active"
								} }).then(load),
								children: "Bật/tắt"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => toggleAsset({ data: {
									id: a.id,
									field: "paused"
								} }).then(load),
								children: "Pause"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => toggleAsset({ data: {
									id: a.id,
									field: "delete"
								} }).then(load),
								children: "Xóa"
							})
						]
					})]
				}, a.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2 rounded-xl border border-border p-4 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Mã (BTCUSD)",
							value: form.symbol,
							onChange: (e) => setForm({
								...form,
								symbol: e.target.value.toUpperCase()
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Tên",
							value: form.name,
							onChange: (e) => setForm({
								...form,
								name: e.target.value
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Giá gốc",
							type: "number",
							value: form.basePrice,
							onChange: (e) => setForm({
								...form,
								basePrice: Number(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Payout %",
							type: "number",
							value: form.payout,
							onChange: (e) => setForm({
								...form,
								payout: Number(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => saveAsset({ data: {
								...form,
								tradeStart: form.tradeStart || null,
								tradeEnd: form.tradeEnd || null
							} }).then(() => {
								toast.success("Đã lưu");
								load();
							}),
							children: "Thêm tài sản"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "market",
				className: "mt-4 space-y-2",
				children: (data?.assets ?? []).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between rounded-xl border border-border p-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: a.symbol }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono",
						children: priceFmt(a.price, a.decimals)
					})]
				}, a.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
				value: "payout",
				className: "mt-4 space-y-4",
				children: [(data?.assets ?? []).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-4",
					onSubmit: (e) => {
						e.preventDefault();
						const fd = new FormData(e.currentTarget);
						saveAsset({ data: {
							id: a.id,
							symbol: a.symbol,
							name: a.name,
							basePrice: a.basePrice,
							decimals: a.decimals,
							payout: Number(fd.get("payout")),
							upRatio: a.upRatio,
							tradeStart: String(fd.get("start") || "") || null,
							tradeEnd: String(fd.get("end") || "") || null
						} }).then(() => {
							toast.success("Đã lưu");
							load();
						});
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "sm:col-span-4 font-medium",
							children: a.symbol
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							name: "payout",
							defaultValue: a.payout,
							type: "number"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							name: "start",
							defaultValue: a.tradeStart ?? "",
							placeholder: "HH:MM bắt đầu"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							name: "end",
							defaultValue: a.tradeEnd ?? "",
							placeholder: "HH:MM kết thúc"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							size: "sm",
							children: "Lưu"
						})
					]
				}, a.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mb-2 text-sm",
						children: "Timeframe"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: (data?.timeframes ?? []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: t.is_active ? "default" : "outline",
							onClick: () => toggleTf({ data: {
								kind: "tf",
								id: t.id
							} }).then(load),
							children: t.label
						}, t.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-4 mb-2 text-sm",
						children: "Expiry"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: (data?.expiries ?? []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: t.is_active ? "default" : "outline",
							onClick: () => toggleTf({ data: {
								kind: "exp",
								id: t.id
							} }).then(load),
							children: t.label
						}, t.id))
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "hist",
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "divide-y divide-border rounded-xl border border-border text-sm",
					children: (hist?.rows ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							r.email,
							" · ",
							r.symbol,
							" ",
							r.direction
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							vnd(r.amount),
							" ",
							r.status
						] })]
					}, r.id))
				})
			})
		]
	})] });
}
//#endregion
export { TradeAdmin as component };
