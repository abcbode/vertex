import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { d as useRouterState, v as Link, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as DialogPortal, i as DialogOverlay, n as DialogClose, r as DialogContent, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { i as signOut } from "./client-B40BzJxt.mjs";
import { n as Logo, r as cn, t as Button } from "./button-BllcHIJj.mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { C as ArrowDownToLine, S as ArrowUpFromLine, _ as ChartColumn, b as Bell, c as Settings, g as Gauge, h as Headset, o as SlidersHorizontal, p as Menu, r as Users, t as X, u as QrCode, v as ChartCandlestick, y as Building2 } from "../_libs/lucide-react.mjs";
import { _ as prepareAdminLogin, t as adminPing } from "./admin-Bp8V99lv.mjs";
import { t as AdminLoginForm } from "./admin-login-form-i21d4EBD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-shell-5m9sW_mQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Sheet = Dialog;
function SheetContent({ className, children, side = "right", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-background/70" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: cn("fixed z-50 flex h-full w-[min(20rem,88vw)] flex-col border-border bg-card p-4", side === "right" ? "top-0 right-0 border-l" : "top-0 left-0 border-r", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
			className: "absolute top-3 right-3 rounded-md p-1 text-muted-foreground hover:bg-accent",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
		})]
	})] });
}
var ITEMS = [
	{
		to: "/admin",
		label: "Dashboard",
		icon: Gauge
	},
	{
		to: "/admin/results",
		label: "Chỉnh kết quả",
		icon: SlidersHorizontal
	},
	{
		to: "/admin/users",
		label: "User",
		icon: Users
	},
	{
		to: "/admin/deposits",
		label: "Nạp tiền",
		icon: ArrowDownToLine
	},
	{
		to: "/admin/withdrawals",
		label: "Rút tiền",
		icon: ArrowUpFromLine
	},
	{
		to: "/admin/trade",
		label: "Trade",
		icon: ChartCandlestick
	},
	{
		to: "/admin/banks",
		label: "Ngân hàng",
		icon: Building2
	},
	{
		to: "/admin/qr",
		label: "QR Code",
		icon: QrCode
	},
	{
		to: "/admin/support",
		label: "CSKH",
		icon: Headset
	},
	{
		to: "/admin/notifications",
		label: "Thông báo",
		icon: Bell
	},
	{
		to: "/admin/reports",
		label: "Báo cáo",
		icon: ChartColumn
	},
	{
		to: "/admin/settings",
		label: "Cài đặt",
		icon: Settings
	}
];
function AdminShell({ children }) {
	const { user, isPending } = useCurrentUserState();
	const path = useRouterState({ select: (s) => s.location.pathname });
	const [gate, setGate] = (0, import_react.useState)("load");
	const [open, setOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		prepareAdminLogin().catch(() => {});
	}, []);
	(0, import_react.useEffect)(() => {
		if (isPending) return;
		if (!user) {
			setGate("no");
			return;
		}
		adminPing().then((p) => {
			if (!p.isAdmin) setGate("no");
			else if (!p.twoFaOk) setGate("2fa");
			else setGate("ok");
		}).catch(() => setGate("no"));
	}, [
		user,
		isPending,
		path
	]);
	if (gate === "2fa" && path !== "/admin/verify") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/admin/verify" });
	if (!(gate === "ok" || gate === "2fa" && path === "/admin/verify")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLoginForm, { onSuccess: () => setGate("ok") });
	const nav = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "flex flex-col gap-1 p-3",
		children: ITEMS.map((it) => {
			const Icon = it.icon;
			const on = it.to === "/admin" ? path === "/admin" || path === "/admin/" : path.startsWith(it.to);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: it.to,
				onClick: () => setOpen(false),
				className: cn("flex h-10 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground", on && "bg-accent text-foreground"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), it.label]
			}, it.to);
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "hidden w-56 shrink-0 border-r border-border md:block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-14 items-center border-b border-border px-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {})
					})
				}), nav]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex h-14 items-center gap-3 border-b border-border px-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "md:hidden",
							onClick: () => setOpen(true),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-muted-foreground",
							children: "Quản trị"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ml-auto flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-sm text-muted-foreground hover:text-foreground",
								onClick: () => void signOut("/admin"),
								children: "Đăng xuất"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								className: "text-sm text-muted-foreground hover:text-foreground",
								children: "Về sàn"
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex-1 p-4 md:p-6",
					children
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
					side: "left",
					className: "p-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-14 items-center border-b border-border px-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {})
					}), nav]
				})
			})
		]
	});
}
//#endregion
export { AdminShell as t };
