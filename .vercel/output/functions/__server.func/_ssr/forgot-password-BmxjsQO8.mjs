import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Logo, t as Button } from "./button-BllcHIJj.mjs";
import { p as requestPasswordReset } from "./user-EfFR6VyT.mjs";
import { t as Input } from "./input-CRLCFB24.mjs";
import { t as Label } from "./label-B2aHMkv2.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/forgot-password-BmxjsQO8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Forgot() {
	const [email, setEmail] = (0, import_react.useState)("");
	const [link, setLink] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function onSubmit(e) {
		e.preventDefault();
		setBusy(true);
		try {
			const res = await requestPasswordReset({ data: { email } });
			if (res.token) setLink(`/reset-password?token=${res.token}`);
			else toast.success("Nếu email tồn tại, hướng dẫn đã được tạo.");
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
					children: "Quên mật khẩu"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit,
					className: "mt-6 space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "email",
							children: "Email"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "email",
							type: "email",
							required: true,
							value: email,
							onChange: (e) => setEmail(e.target.value)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						disabled: busy,
						children: "Gửi yêu cầu"
					})]
				}),
				link && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 text-sm",
					children: [
						"Môi trường demo — dùng liên kết:",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: link,
							className: "text-steel underline",
							children: "Đặt lại mật khẩu"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/login",
					className: "mt-4 block text-center text-sm text-muted-foreground",
					children: "Quay lại đăng nhập"
				})
			]
		})
	});
}
//#endregion
export { Forgot as component };
