import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as authClient } from "./client-B40BzJxt.mjs";
import { n as Logo, t as Button } from "./button-BllcHIJj.mjs";
import { s as Shield } from "../_libs/lucide-react.mjs";
import { t as Input } from "./input-CRLCFB24.mjs";
import { t as Label } from "./label-B2aHMkv2.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as prepareAdminLogin, t as adminPing } from "./admin-Bp8V99lv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-login-form-i21d4EBD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function accountToEmail(raw) {
	const v = raw.trim();
	if (!v) return v;
	if (v.includes("@")) return v;
	if (v.toLowerCase() === "admin") return "admin@vertex.app";
	return v;
}
function AdminLoginForm({ onSuccess }) {
	const nav = useNavigate();
	const [username, setUsername] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function onSubmit(e) {
		e.preventDefault();
		setBusy(true);
		try {
			await prepareAdminLogin();
			const email = accountToEmail(username);
			const { error } = await authClient.signIn.email({
				email,
				password
			});
			if (error) throw new Error("Sai tài khoản hoặc mật khẩu");
			const p = await adminPing();
			if (!p.isAdmin) throw new Error("Sai tài khoản hoặc mật khẩu");
			if (!p.twoFaOk) {
				nav({ to: "/admin/verify" });
				return;
			}
			onSuccess?.();
			nav({ to: "/admin" });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Đăng nhập thất bại");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-background p-6 surface-grid",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex items-center gap-2 text-steel",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs tracking-wide uppercase",
						children: "Khu vực quản trị"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 text-xl font-semibold tracking-tight",
					children: "Đăng nhập admin"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Nhập tài khoản và mật khẩu quản trị để tiếp tục."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit,
					className: "mt-6 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "admin-user",
								children: "Tài khoản"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "admin-user",
								autoComplete: "username",
								required: true,
								value: username,
								onChange: (e) => setUsername(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "admin-pass",
								children: "Mật khẩu"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "admin-pass",
								type: "password",
								autoComplete: "current-password",
								required: true,
								value: password,
								onChange: (e) => setPassword(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "w-full",
							disabled: busy,
							children: busy ? "Đang xử lý…" : "Đăng nhập"
						})
					]
				})
			]
		})
	});
}
//#endregion
export { AdminLoginForm as t };
