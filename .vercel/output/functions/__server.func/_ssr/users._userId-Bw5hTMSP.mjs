import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as vnd } from "./format-Bc8Vy2YH.mjs";
import { t as Button } from "./button-BllcHIJj.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { E as setUserStatus, T as setUserRole, s as getUserAdmin, v as resetUserPassword } from "./admin-Bp8V99lv.mjs";
import { t as AdminShell } from "./admin-shell-5m9sW_mQ.mjs";
import { n as CardContent, t as Card } from "./card-BKV4ShhV.mjs";
import { t as Badge } from "./badge-fhx-I2rq.mjs";
import { n as Route$1 } from "./router-CFUmK3BJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/users._userId-Bw5hTMSP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function UserDetail() {
	const { userId } = Route$1.useParams();
	const [u, setU] = (0, import_react.useState)(null);
	function load() {
		getUserAdmin({ data: { userId } }).then(setU).catch((e) => toast.error(String(e)));
	}
	(0, import_react.useEffect)(() => {
		load();
	}, [userId]);
	if (!u) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, { children: "Đang tải…" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/admin/users",
			className: "text-sm text-muted-foreground",
			children: "← Danh sách"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-2 text-xl font-semibold",
			children: u.email
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm text-muted-foreground",
			children: [
				u.displayName,
				" · ",
				u.phone || "chưa có SĐT",
				" · ",
				u.role
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-3 sm:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: "Số dư"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-xl",
						children: vnd(u.wallet.balance)
					})]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: "Tổng nạp"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-xl",
						children: vnd(u.wallet.totalDeposit)
					})]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: "Tổng rút"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-xl",
						children: vnd(u.wallet.totalWithdraw)
					})]
				}) })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex flex-wrap gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => setUserStatus({ data: {
						userId,
						status: u.status === "locked" ? "active" : "locked"
					} }).then(load),
					children: u.status === "locked" ? "Mở khóa" : "Khóa user"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => setUserRole({ data: {
						userId,
						role: u.role === "admin" ? "user" : "admin"
					} }).then(load).catch((e) => toast.error(e instanceof Error ? e.message : "Lỗi")),
					children: u.role === "admin" ? "Hạ user" : "Cấp admin"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: async () => toast.success((await resetUserPassword({ data: { userId } })).password),
					children: "Reset mật khẩu"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-8 mb-2 text-sm font-medium",
			children: "Lịch sử trade"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "divide-y divide-border rounded-xl border border-border text-sm",
			children: u.trades.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					t.symbol,
					" ",
					t.direction
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					vnd(t.amount),
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: t.status === "win" ? "up" : "down",
						children: t.status
					})
				] })]
			}, t.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-8 mb-2 text-sm font-medium",
			children: "Lịch sử đăng nhập"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "divide-y divide-border rounded-xl border border-border text-sm",
			children: u.logins.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-3",
				children: [
					new Date(l.createdAt).toLocaleString("vi-VN"),
					" · ",
					l.userAgent
				]
			}, l.id))
		})
	] });
}
//#endregion
export { UserDetail as component };
