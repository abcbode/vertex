import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as signOut, t as authClient } from "./client-B40BzJxt.mjs";
import { r as getBootstrap } from "./core-hltlGHwq.mjs";
import { t as Button } from "./button-BllcHIJj.mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { h as updateProfile, l as listLoginHistory, n as changeEmail } from "./user-EfFR6VyT.mjs";
import { o as UserButton, t as AppShell } from "./app-shell-D1i_Vq6F.mjs";
import { t as Input } from "./input-CRLCFB24.mjs";
import { t as Label } from "./label-B2aHMkv2.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-BGc9tfN7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AccountPage() {
	const { user } = useCurrentUserState();
	const [name, setName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [cur, setCur] = (0, import_react.useState)("");
	const [next, setNext] = (0, import_react.useState)("");
	const [logins, setLogins] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		getBootstrap().then((b) => {
			setName(b.profile.displayName);
			setPhone(b.profile.phone);
			setEmail(b.profile.email);
		}).catch(() => {});
		listLoginHistory().then(setLogins).catch(() => {});
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-lg space-y-6 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold",
					children: "Tài khoản"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: user?.primaryEmail
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-3 rounded-xl border border-border p-4",
				onSubmit: async (e) => {
					e.preventDefault();
					try {
						await updateProfile({ data: {
							displayName: name,
							phone
						} });
						toast.success("Đã lưu thông tin");
					} catch (err) {
						toast.error(err instanceof Error ? err.message : "Lỗi");
					}
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-medium",
						children: "Sửa thông tin"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Tên" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: name,
							onChange: (e) => setName(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Số điện thoại" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: phone,
							onChange: (e) => setPhone(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Lưu"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-3 rounded-xl border border-border p-4",
				onSubmit: async (e) => {
					e.preventDefault();
					try {
						await changeEmail({ data: { email } });
						toast.success("Đã đổi email");
					} catch (err) {
						toast.error(err instanceof Error ? err.message : "Lỗi");
					}
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-medium",
						children: "Đổi email"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "email",
						value: email,
						onChange: (e) => setEmail(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Cập nhật email"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-3 rounded-xl border border-border p-4",
				onSubmit: async (e) => {
					e.preventDefault();
					try {
						const { error } = await authClient.changePassword({
							currentPassword: cur,
							newPassword: next
						});
						if (error) throw new Error(error.message);
						toast.success("Đã đổi mật khẩu");
						setCur("");
						setNext("");
					} catch (err) {
						toast.error(err instanceof Error ? err.message : "Lỗi");
					}
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-medium",
						children: "Đổi mật khẩu"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "password",
						placeholder: "Mật khẩu hiện tại",
						value: cur,
						onChange: (e) => setCur(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "password",
						placeholder: "Mật khẩu mới",
						minLength: 8,
						value: next,
						onChange: (e) => setNext(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Đổi mật khẩu"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-2 font-medium",
				children: "Lịch sử đăng nhập"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "divide-y divide-border rounded-xl border border-border text-sm",
				children: logins.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: new Date(l.createdAt).toLocaleString("vi-VN") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: l.userAgent
					})]
				}, l.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				className: "w-full",
				onClick: () => void signOut("/login"),
				children: "Đăng xuất"
			})
		]
	}) });
}
//#endregion
export { AccountPage as component };
