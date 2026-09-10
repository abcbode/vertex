import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as countdown, s as priceFmt, u as vnd } from "./format-Bc8Vy2YH.mjs";
import { r as cn, t as Button } from "./button-BllcHIJj.mjs";
import { a as DialogTitle, i as DialogHeader, n as Dialog, r as DialogContent, t as AppShell } from "./app-shell-D1i_Vq6F.mjs";
import { t as Input } from "./input-CRLCFB24.mjs";
import { t as Label } from "./label-B2aHMkv2.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Badge } from "./badge-fhx-I2rq.mjs";
import { n as listRunningTrades, r as placeTrade } from "./trade-C4h97FLa.mjs";
import { r as getMarket } from "./market-ChV-qq7k.mjs";
import { r as Route$18 } from "./router-CFUmK3BJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/trade-D7JnnAkK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CandleChart({ candles, decimals, levels = [] }) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const parent = canvas.parentElement;
		if (!parent) return;
		const draw = () => {
			const dpr = window.devicePixelRatio || 1;
			const w = parent.clientWidth;
			const h = parent.clientHeight;
			canvas.width = Math.max(1, Math.floor(w * dpr));
			canvas.height = Math.max(1, Math.floor(h * dpr));
			canvas.style.width = `${w}px`;
			canvas.style.height = `${h}px`;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.clearRect(0, 0, w, h);
			const cs = getComputedStyle(document.documentElement);
			const muted = cs.getPropertyValue("--color-muted-foreground").trim() || "#8b919c";
			const up = cs.getPropertyValue("--color-up").trim() || "#3dba80";
			const down = cs.getPropertyValue("--color-down").trim() || "#e05656";
			const border = cs.getPropertyValue("--color-border").trim() || "#262c36";
			const padL = 8;
			const padR = 64;
			const padT = 16;
			const padB = 24;
			const data = candles.length ? candles : [{
				time: Date.now(),
				open: 1,
				high: 1,
				low: 1,
				close: 1
			}];
			let min = Math.min(...data.map((c) => c.low), ...levels.map((l) => l.price));
			let max = Math.max(...data.map((c) => c.high), ...levels.map((l) => l.price));
			if (min === max) {
				min -= min * .002;
				max += max * .002;
			}
			const span = max - min || 1;
			const plotW = w - padL - padR;
			const plotH = h - padT - padB;
			const slot = plotW / data.length;
			const yOf = (v) => padT + (max - v) / span * plotH;
			ctx.strokeStyle = border;
			ctx.lineWidth = 1;
			ctx.setLineDash([3, 6]);
			const steps = 4;
			ctx.font = "11px IBM Plex Mono, ui-monospace, monospace";
			ctx.fillStyle = muted;
			ctx.textAlign = "left";
			for (let i = 0; i <= steps; i++) {
				const v = max - span * i / steps;
				const y = yOf(v);
				ctx.beginPath();
				ctx.moveTo(padL, y);
				ctx.lineTo(w - padR + 8, y);
				ctx.stroke();
				ctx.fillText(v.toFixed(decimals), w - padR + 12, y + 4);
			}
			ctx.setLineDash([]);
			data.forEach((c, i) => {
				const x = padL + i * slot + slot / 2;
				const bull = c.close >= c.open;
				ctx.strokeStyle = bull ? up : down;
				ctx.fillStyle = bull ? up : down;
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(x, yOf(c.high));
				ctx.lineTo(x, yOf(c.low));
				ctx.stroke();
				const y1 = yOf(Math.max(c.open, c.close));
				const y2 = yOf(Math.min(c.open, c.close));
				const bw = Math.max(3, slot * .62);
				const bh = Math.max(1, y2 - y1);
				ctx.fillRect(x - bw / 2, y1, bw, bh);
			});
			levels.forEach((lv) => {
				const y = yOf(lv.price);
				ctx.setLineDash([5, 4]);
				ctx.strokeStyle = lv.tone === "up" ? up : down;
				ctx.lineWidth = 1.4;
				ctx.beginPath();
				ctx.moveTo(padL, y);
				ctx.lineTo(w - padR, y);
				ctx.stroke();
				ctx.setLineDash([]);
				ctx.fillStyle = lv.tone === "up" ? up : down;
				ctx.textAlign = "left";
				ctx.fillText(lv.label, 12, y - 5);
			});
			const last = data[data.length - 1];
			const py = yOf(last.close);
			ctx.setLineDash([4, 4]);
			ctx.strokeStyle = last.close >= last.open ? up : down;
			ctx.beginPath();
			ctx.moveTo(padL, py);
			ctx.lineTo(w - padR, py);
			ctx.stroke();
			ctx.setLineDash([]);
			ctx.fillStyle = last.close >= last.open ? up : down;
			const label = last.close.toFixed(decimals);
			ctx.fillRect(w - padR + 8, py - 9, 54, 16);
			ctx.fillStyle = "#0a0c10";
			ctx.textAlign = "center";
			ctx.fillText(label, w - padR + 35, py + 3);
			ctx.fillStyle = muted;
			ctx.textAlign = "left";
			if (data.length > 1) {
				const first = data[0];
				ctx.fillText(new Date(first.time).toLocaleTimeString("vi-VN", {
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit"
				}), padL, h - 8);
				ctx.textAlign = "right";
				ctx.fillText(new Date(last.time).toLocaleTimeString("vi-VN", {
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit"
				}), w - padR, h - 8);
			}
		};
		draw();
		const ro = new ResizeObserver(draw);
		ro.observe(parent);
		return () => ro.disconnect();
	}, [
		candles,
		decimals,
		levels
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		className: "h-full w-full"
	});
}
function TradePage() {
	const { asset: assetQ } = Route$18.useSearch();
	const [assetId, setAssetId] = (0, import_react.useState)(assetQ ?? 1);
	const [tf, setTf] = (0, import_react.useState)(15);
	const [expiry, setExpiry] = (0, import_react.useState)(30);
	const [amount, setAmount] = (0, import_react.useState)("100000");
	const [market, setMarket] = (0, import_react.useState)(null);
	const [running, setRunning] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(null);
	const [freezePrice, setFreezePrice] = (0, import_react.useState)(0);
	const [now, setNow] = (0, import_react.useState)(Date.now());
	const load = (0, import_react.useCallback)(async () => {
		try {
			const m = await getMarket({ data: {
				assetId,
				timeframe: tf
			} });
			setMarket(m);
			const r = await listRunningTrades();
			setRunning(r);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Lỗi thị trường");
		}
	}, [assetId, tf]);
	(0, import_react.useEffect)(() => {
		load();
		const t = setInterval(() => void load(), 1e3);
		return () => clearInterval(t);
	}, [load]);
	(0, import_react.useEffect)(() => {
		const t = setInterval(() => setNow(Date.now()), 250);
		return () => clearInterval(t);
	}, []);
	const amt = Number(amount) || 0;
	const payout = market?.asset.payout ?? 85;
	const receive = amt + amt * payout / 100;
	const ohlc = market?.ohlc;
	const livePrice = market?.asset.price ?? 0;
	const liveDecimals = market?.asset.decimals ?? 2;
	const entryLevels = (0, import_react.useMemo)(() => (running?.rows ?? []).filter((t) => t.status === "running").map((t) => ({
		price: t.entryPrice,
		tone: t.direction === "up" ? "up" : "down",
		label: `Mốc ${t.direction === "up" ? "UP" : "DOWN"} ${priceFmt(t.entryPrice, t.decimals)}`
	})), [running]);
	async function confirm() {
		if (!pending) return;
		const freeze = freezePrice || livePrice;
		try {
			const t = await placeTrade({ data: {
				assetId,
				direction: pending,
				amount: amt,
				expirySeconds: expiry,
				entryPrice: freeze
			} });
			toast.success("Đã đặt lệnh");
			setPending(null);
			setRunning((prev) => ({
				balance: Math.max(0, (prev?.balance ?? 0) - amt),
				rows: [{
					id: t.id,
					symbol: t.symbol,
					decimals: t.decimals,
					direction: t.direction,
					amount: t.amount,
					payout: t.payout,
					entryPrice: t.entryPrice,
					status: t.status,
					profit: null,
					expiresAt: t.expiresAt,
					openedAt: t.openedAt
				}, ...(prev?.rows ?? []).filter((r) => r.id !== t.id)]
			}));
			await load();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Không đặt được lệnh");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid max-w-6xl gap-3 p-3 lg:grid-cols-[1fr_20rem]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-[28rem] flex-col rounded-xl border border-border bg-card",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2 border-b border-border p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "h-10 rounded-md border border-input bg-background px-2 text-sm",
						value: assetId,
						onChange: (e) => setAssetId(Number(e.target.value)),
						children: (market?.assets ?? []).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: a.id,
							children: a.symbol
						}, a.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex rounded-md bg-muted p-1",
						children: (market?.timeframes ?? []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setTf(t.seconds),
							className: cn("h-8 rounded-sm px-2 text-xs", tf === t.seconds && "bg-card"),
							children: t.label
						}, t.seconds))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono text-lg tabular",
							children: priceFmt(market?.asset.price ?? 0, market?.asset.decimals ?? 2)
						}), ohlc && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2 text-[11px] text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["O ", priceFmt(ohlc.open, market?.asset.decimals ?? 2)] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["H ", priceFmt(ohlc.high, market?.asset.decimals ?? 2)] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["L ", priceFmt(ohlc.low, market?.asset.decimals ?? 2)] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["C ", priceFmt(ohlc.close, market?.asset.decimals ?? 2)] })
							]
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-72 flex-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CandleChart, {
					candles: market?.candles ?? [],
					decimals: liveDecimals,
					levels: entryLevels
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-border bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Số dư"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono tabular",
							children: vnd(running?.balance ?? 0)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Số tiền trade" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: amount,
								onChange: (e) => setAmount(e.target.value.replace(/[^\d]/g, "")),
								inputMode: "numeric"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1",
								children: [
									5e4,
									1e5,
									2e5,
									5e5,
									1e6
								].map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setAmount(String(q)),
									className: "rounded-md border border-border px-2 py-1 text-xs hover:bg-accent",
									children: vnd(q)
								}, q))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Thời gian kết thúc" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1",
							children: (market?.expiries ?? []).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setExpiry(e.seconds),
								className: cn("rounded-md border border-border px-2 py-1 text-xs", expiry === e.seconds && "border-ring bg-accent"),
								children: e.label
							}, e.seconds))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Payout"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [payout, "%"] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Có thể nhận"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-up tabular",
							children: vnd(receive)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "up",
							className: "h-14 text-base",
							onClick: () => {
								setFreezePrice(livePrice);
								setPending("up");
							},
							disabled: market?.asset.paused,
							children: "MUA / UP"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "down",
							className: "h-14 text-base",
							onClick: () => {
								setFreezePrice(livePrice);
								setPending("down");
							},
							disabled: market?.asset.paused,
							children: "BÁN / DOWN"
						})]
					}),
					market?.asset.paused && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-warn",
						children: "Tài sản đang tạm dừng."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-border bg-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-medium",
					children: "Lệnh đang chạy"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 space-y-2",
					children: [(running?.rows ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Chưa có lệnh."
					}), (running?.rows ?? []).map((t) => {
						const cd = countdown(t.expiresAt);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md border border-border p-2 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium",
										children: t.symbol
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: t.direction === "up" ? "up" : "down",
										children: t.direction === "up" ? "UP" : "DOWN"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex items-baseline justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "Mốc giá"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-base tabular text-foreground",
										children: priceFmt(t.entryPrice, t.decimals)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 flex justify-between text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Hiện tại" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-foreground",
										children: priceFmt(livePrice, liveDecimals)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 flex justify-between text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: vnd(t.amount) }), t.status === "running" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-foreground",
										children: cd.label
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: t.status === "win" ? "text-up" : "text-down",
										children: [
											t.status === "win" ? "LÃI" : t.status === "refund" ? "HÒA" : "LỖ",
											" ",
											t.profit != null ? vnd(t.profit) : ""
										]
									})]
								})
							]
						}, t.id);
					})]
				})]
			})]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: Boolean(pending),
		onOpenChange: (o) => !o && setPending(null),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Xác nhận lệnh" }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "space-y-2 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-muted-foreground",
							children: "Tài sản"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: market?.asset.symbol })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-muted-foreground",
							children: "Hướng"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: pending === "up" ? "text-up" : "text-down",
							children: pending === "up" ? "MUA / UP" : "BÁN / DOWN"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-muted-foreground",
							children: "Mốc giá đặt lệnh"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "font-mono",
							children: priceFmt(freezePrice || livePrice, liveDecimals)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-muted-foreground",
							children: "Số tiền"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "font-mono",
							children: vnd(amt)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-muted-foreground",
							children: "Thời gian"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [expiry, "s"] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-muted-foreground",
							children: "Payout"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [payout, "%"] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-muted-foreground",
							children: "Có thể nhận"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "font-mono text-up",
							children: vnd(receive)
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-3 w-full",
				variant: pending === "up" ? "up" : "down",
				onClick: () => void confirm(),
				children: "Xác nhận đặt lệnh"
			})
		] })
	})] });
}
//#endregion
export { TradePage as component };
