import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { b as useNavigate, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Logo, t as Button } from "./button-BllcHIJj.mjs";
import { m as resetPasswordWithToken } from "./user-EfFR6VyT.mjs";
import { t as Input } from "./input-CRLCFB24.mjs";
import { t as Label } from "./label-B2aHMkv2.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-password-D7EmtCGP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Reset() {
	const nav = useNavigate();
	const token = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("token") ?? "" : "";
	const [password, setPassword] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function onSubmit(e) {
		e.preventDefault();
		setBusy(true);
		try {
			await resetPasswordWithToken({ data: {
				token,
				password
			} });
			toast.success("Đã đổi mật khẩu");
			nav({ to: "/login" });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Lỗi");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm rounded-xl border border-border bg-card p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 text-xl font-semibold",
					children: "Đặt lại mật khẩu"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit,
					className: "mt-6 space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "password",
							children: "Mật khẩu mới"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "password",
							type: "password",
							minLength: 8,
							required: true,
							value: password,
							onChange: (e) => setPassword(e.target.value)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						disabled: busy || !token,
						children: "Cập nhật"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/login",
					className: "mt-4 block text-center text-sm text-muted-foreground",
					children: "Đăng nhập"
				})
			]
		})
	});
}
//#endregion
export { Reset as component };
