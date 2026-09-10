import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as authClient } from "./client-B40BzJxt.mjs";
import { r as cn, t as Button } from "./button-BllcHIJj.mjs";
import { t as Input } from "./input-CRLCFB24.mjs";
import { t as Label } from "./label-B2aHMkv2.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { D as setupAdmin2fa, i as exportBackup, n as confirmAdmin2fa, o as getSettings, p as listErrors, r as disableAdmin2fa, w as saveSettings } from "./admin-Bp8V99lv.mjs";
import { t as AdminShell } from "./admin-shell-5m9sW_mQ.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/@radix-ui/react-switch+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-0NH8HQP9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Switch({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
		className: cn("peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-border bg-muted transition-colors data-[state=checked]:bg-primary", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: "block size-5 translate-x-0.5 rounded-full bg-foreground transition-transform data-[state=checked]:translate-x-[22px] data-[state=checked]:bg-primary-foreground" })
	});
}
function SettingsPage() {
	const [s, setS] = (0, import_react.useState)({});
	const [secret, setSecret] = (0, import_react.useState)(null);
	const [uri, setUri] = (0, import_react.useState)("");
	const [code, setCode] = (0, import_react.useState)("");
	const [errors, setErrors] = (0, import_react.useState)([]);
	const [cur, setCur] = (0, import_react.useState)("");
	const [next, setNext] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		getSettings().then(setS).catch((e) => toast.error(String(e)));
		listErrors().then(setErrors).catch(() => {});
	}, []);
	function set(k, v) {
		setS((p) => ({
			...p,
			[k]: v
		}));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mb-4 text-xl font-semibold",
			children: "Cài đặt hệ thống"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid max-w-lg gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Tên sàn" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: s.site_name ?? "",
						onChange: (e) => set("site_name", e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Prefix nội dung CK" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: s.transfer_prefix ?? "",
						onChange: (e) => set("transfer_prefix", e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Thưởng chào mừng" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: s.welcome_bonus ?? "",
						onChange: (e) => set("welcome_bonus", e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nạp tối thiểu" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: s.min_deposit ?? "",
						onChange: (e) => set("min_deposit", e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Rút tối thiểu" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: s.min_withdraw ?? "",
						onChange: (e) => set("min_withdraw", e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Trade tối thiểu" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: s.min_trade ?? "",
						onChange: (e) => set("min_trade", e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between rounded-md border border-border p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Bảo trì giao dịch" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
						checked: s.maintenance === "true",
						onCheckedChange: (c) => set("maintenance", c ? "true" : "false")
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => saveSettings({ data: s }).then(() => toast.success("Đã lưu")),
					children: "Lưu cài đặt"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-8 mb-2 font-medium",
			children: "Đổi mật khẩu admin"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "flex max-w-lg flex-col gap-2",
			onSubmit: async (e) => {
				e.preventDefault();
				const { error } = await authClient.changePassword({
					currentPassword: cur,
					newPassword: next
				});
				if (error) toast.error(error.message);
				else toast.success("Đã đổi mật khẩu");
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "password",
					placeholder: "Mật khẩu hiện tại",
					value: cur,
					onChange: (e) => setCur(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "password",
					placeholder: "Mật khẩu mới",
					value: next,
					onChange: (e) => setNext(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Đổi mật khẩu"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-8 mb-2 font-medium",
			children: "2FA quản trị"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-lg space-y-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: async () => {
					const r = await setupAdmin2fa();
					setSecret(r.secret);
					setUri(r.uri);
				},
				children: "Tạo secret 2FA"
			}), secret && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md border border-border p-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Nhập secret vào Google Authenticator:" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono",
						children: secret
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						alt: "QR 2FA",
						className: "mt-2 size-40 bg-primary",
						src: `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(uri)}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-2",
						placeholder: "Mã 6 số",
						value: code,
						onChange: (e) => setCode(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-2",
						onClick: () => confirmAdmin2fa({ data: { code } }).then(() => toast.success("Đã bật 2FA")),
						children: "Xác nhận bật"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-2",
						variant: "outline",
						onClick: () => disableAdmin2fa({ data: { code } }).then(() => toast.success("Đã tắt 2FA")),
						children: "Tắt 2FA"
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-8 mb-2 font-medium",
			children: "Sao lưu dữ liệu"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			onClick: async () => {
				const dump = await exportBackup();
				const blob = new Blob([dump.json], { type: "application/json" });
				const a = document.createElement("a");
				a.href = URL.createObjectURL(blob);
				a.download = `vertex-backup-${Date.now()}.json`;
				a.click();
			},
			children: "Tải bản sao lưu JSON"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-8 mb-2 font-medium",
			children: "Error log"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "divide-y divide-border rounded-xl border border-border text-sm",
			children: [errors.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-3",
				children: [e.message, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted-foreground",
					children: new Date(e.createdAt).toLocaleString("vi-VN")
				})]
			}, e.id)), errors.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "p-3 text-muted-foreground",
				children: "Không có lỗi."
			})]
		})
	] });
}
//#endregion
export { SettingsPage as component };
