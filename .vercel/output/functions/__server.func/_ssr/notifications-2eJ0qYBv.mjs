import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-BllcHIJj.mjs";
import { r as listNotificationsAdmin, s as saveNotification, t as deleteNotification } from "./cms-PRMuySGH.mjs";
import { t as Input } from "./input-CRLCFB24.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as AdminShell } from "./admin-shell-5m9sW_mQ.mjs";
import { t as Textarea } from "./textarea-D9CTZkC9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications-2eJ0qYBv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function NotiAdmin() {
	const [rows, setRows] = (0, import_react.useState)([]);
	const [form, setForm] = (0, import_react.useState)({
		title: "",
		body: "",
		imageUrl: "",
		type: "in_app",
		audience: "all",
		targetUserId: "",
		targetGroup: "active"
	});
	function load() {
		listNotificationsAdmin().then(setRows).catch((e) => toast.error(String(e)));
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mb-4 text-xl font-semibold",
			children: "Thông báo"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-2 rounded-xl border border-border p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Tiêu đề",
					value: form.title,
					onChange: (e) => setForm({
						...form,
						title: e.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					placeholder: "Nội dung",
					value: form.body,
					onChange: (e) => setForm({
						...form,
						body: e.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "URL hình (tuỳ chọn)",
					value: form.imageUrl,
					onChange: (e) => setForm({
						...form,
						imageUrl: e.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "h-11 rounded-md border border-input bg-background px-3 text-sm",
						value: form.type,
						onChange: (e) => setForm({
							...form,
							type: e.target.value
						}),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "in_app",
								children: "Trong app"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "popup",
								children: "Popup"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "both",
								children: "Cả hai"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "h-11 rounded-md border border-input bg-background px-3 text-sm",
						value: form.audience,
						onChange: (e) => setForm({
							...form,
							audience: e.target.value
						}),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "Toàn bộ user"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "user",
								children: "Một user"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "group",
								children: "Nhóm"
							})
						]
					})]
				}),
				form.audience === "user" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "User ID",
					value: form.targetUserId,
					onChange: (e) => setForm({
						...form,
						targetUserId: e.target.value
					})
				}),
				form.audience === "group" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "h-11 rounded-md border border-input bg-background px-3 text-sm",
					value: form.targetGroup,
					onChange: (e) => setForm({
						...form,
						targetGroup: e.target.value
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "active",
						children: "User hoạt động"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "locked",
						children: "User bị khóa"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => saveNotification({ data: {
						title: form.title,
						body: form.body,
						imageUrl: form.imageUrl,
						type: form.type,
						audience: form.audience,
						targetUserId: form.audience === "user" ? form.targetUserId : null,
						targetGroup: form.audience === "group" ? form.targetGroup : null
					} }).then(() => {
						toast.success("Đã gửi");
						load();
					}),
					children: "Gửi thông báo"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 space-y-2",
			children: rows.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between gap-3 rounded-xl border border-border p-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-medium",
					children: n.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-xs text-muted-foreground",
					children: [
						n.type,
						" · ",
						n.audience,
						" · đã đọc ",
						n.reads
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: () => deleteNotification({ data: { id: n.id } }).then(load),
					children: "Xóa"
				})]
			}, n.id))
		})
	] });
}
//#endregion
export { NotiAdmin as component };
