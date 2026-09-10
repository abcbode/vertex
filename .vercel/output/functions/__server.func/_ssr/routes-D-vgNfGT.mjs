import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as priceFmt, u as vnd } from "./format-Bc8Vy2YH.mjs";
import { r as getBootstrap } from "./core-hltlGHwq.mjs";
import { r as cn, t as Button } from "./button-BllcHIJj.mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { n as Wallet, s as Shield, v as ChartCandlestick, w as ArrowDownRight, x as ArrowUpRight } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./app-shell-D1i_Vq6F.mjs";
import { n as CardContent, t as Card } from "./card-BKV4ShhV.mjs";
import { t as listMyTrades } from "./trade-C4h97FLa.mjs";
import { i as getPublicTicker } from "./market-ChV-qq7k.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D-vgNfGT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const { user } = useCurrentUserState();
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dashboard, {}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landing, {});
}
function Ticker({ assets }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
		children: assets.map((a) => {
			const up = a.change >= 0;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/trade",
				search: { asset: a.id },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "transition-colors hover:border-ring",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "flex items-center justify-between gap-3 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium",
							children: a.symbol
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: a.name
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-sm tabular",
								children: priceFmt(a.price, a.decimals)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: cn("text-xs", up ? "text-up" : "text-down"),
								children: [
									up ? "+" : "",
									a.change.toFixed(2),
									"%"
								]
							})]
						})]
					})
				})
			}, a.id);
		})
	});
}
function Landing() {
	const [assets, setAssets] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		getPublicTicker().then(setAssets).catch(() => {});
		const t = setInterval(() => getPublicTicker().then(setAssets).catch(() => {}), 3e3);
		return () => clearInterval(t);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		requireAuth: false,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative overflow-hidden px-4 py-16 md:py-24",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 surface-grid opacity-60" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto max-w-3xl text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.2em] text-steel uppercase",
						children: "Sàn Binary Options"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-6xl",
						children: "Đọc nến. Đặt lệnh. Kết thúc trong giây."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-4 max-w-xl text-muted-foreground",
						children: "VERTEX là bàn giao dịch UP / DOWN với nến realtime, nạp rút ngân hàng Việt Nam và ví rõ ràng."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-wrap justify-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/register",
								children: "Mở tài khoản"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "lg",
							variant: "outline",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								children: "Đăng nhập"
							})
						})]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-5xl px-4 pb-16",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 text-sm font-medium text-muted-foreground",
					children: "Thị trường"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ticker, { assets }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-10 grid gap-3 md:grid-cols-3",
					children: [
						{
							icon: ChartCandlestick,
							t: "Nến realtime",
							d: "Khung 5s đến 5 phút, giá OHLC luôn hiện."
						},
						{
							icon: Wallet,
							t: "Nạp rút ngân hàng",
							d: "QR VietQR, nội dung chuyển khoản, duyệt trạng thái."
						},
						{
							icon: Shield,
							t: "CSKH 24/7",
							d: "Telegram, Zalo, Messenger — một chạm."
						}
					].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(x.icon, { className: "size-5 text-steel" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-3 font-medium",
								children: x.t
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: x.d
							})
						]
					}) }, x.t))
				})
			]
		})]
	});
}
function Dashboard() {
	const [assets, setAssets] = (0, import_react.useState)([]);
	const [bal, setBal] = (0, import_react.useState)(0);
	const [stats, setStats] = (0, import_react.useState)({
		win: 0,
		loss: 0
	});
	(0, import_react.useEffect)(() => {
		getPublicTicker().then(setAssets).catch(() => {});
		getBootstrap().then((b) => setBal(b.wallet.balance)).catch(() => {});
		listMyTrades({ data: { page: 1 } }).then((t) => setStats({
			win: t.win,
			loss: t.loss
		})).catch(() => {});
		const t = setInterval(() => getPublicTicker().then(setAssets).catch(() => {}), 3e3);
		return () => clearInterval(t);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl space-y-6 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: "Số dư"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 font-mono text-2xl tabular",
							children: vnd(bal)
						})]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1 text-xs text-up",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-3" }), " Tổng lãi"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 font-mono text-2xl tabular text-up",
							children: vnd(stats.win)
						})]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1 text-xs text-down",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownRight, { className: "size-3" }), " Tổng lỗ"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 font-mono text-2xl tabular text-down",
							children: vnd(stats.loss)
						})]
					}) })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/trade",
						children: "Giao dịch"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/deposit",
						children: "Nạp tiền"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ticker, { assets })
		]
	});
}
//#endregion
export { Home as component };
