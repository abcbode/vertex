import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-BllcHIJj.mjs";
import { c as saveSupport, i as listSupportAdmin, l as toggleSupport } from "./cms-PRMuySGH.mjs";
import { t as Input } from "./input-CRLCFB24.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as AdminShell } from "./admin-shell-5m9sW_mQ.mjs";
import { t as Textarea } from "./textarea-D9CTZkC9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/support-C5VcvOK6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SupportAdmin() {
	const [rows, setRows] = (0, import_react.useState)([]);
	const empty = {
		name: "",
		avatarUrl: "",
		bio: "",
		telegram: "",
		zalo: "",
		messenger: "",
		phone: "",
		sortOrder: 0
	};
	const [form, setForm] = (0, import_react.useState)(empty);
	const [editId, setEditId] = (0, import_react.useState)();
	function load() {
		listSupportAdmin().then(setRows).catch((e) => toast.error(String(e)));
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mb-4 text-xl font-semibold",
			children: "CSKH"
		}),
		rows.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-2 flex items-center justify-between rounded-xl border border-border p-3 text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "font-medium",
				children: [
					a.name,
					" ",
					a.isActive ? "" : "(tắt)"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-xs text-muted-foreground",
				children: [
					a.phone,
					" · thứ tự ",
					a.sortOrder
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => {
							setEditId(a.id);
							setForm({
								name: a.name,
								avatarUrl: a.avatarUrl,
								bio: a.bio,
								telegram: a.telegram,
								zalo: a.zalo,
								messenger: a.messenger,
								phone: a.phone,
								sortOrder: a.sortOrder
							});
						},
						children: "Sửa"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => toggleSupport({ data: { id: a.id } }).then(load),
						children: "Bật/tắt"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => toggleSupport({ data: {
							id: a.id,
							del: true
						} }).then(load),
						children: "Xóa"
					})
				]
			})]
		}, a.id)),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-2 rounded-xl border border-border p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Tên",
					value: form.name,
					onChange: (e) => setForm({
						...form,
						name: e.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					placeholder: "Giới thiệu",
					value: form.bio,
					onChange: (e) => setForm({
						...form,
						bio: e.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Telegram URL",
					value: form.telegram,
					onChange: (e) => setForm({
						...form,
						telegram: e.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Zalo URL",
					value: form.zalo,
					onChange: (e) => setForm({
						...form,
						zalo: e.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Messenger URL",
					value: form.messenger,
					onChange: (e) => setForm({
						...form,
						messenger: e.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Số điện thoại",
					value: form.phone,
					onChange: (e) => setForm({
						...form,
						phone: e.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Thứ tự",
					type: "number",
					value: form.sortOrder,
					onChange: (e) => setForm({
						...form,
						sortOrder: Number(e.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Avatar URL",
					value: form.avatarUrl,
					onChange: (e) => setForm({
						...form,
						avatarUrl: e.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => saveSupport({ data: {
						...form,
						id: editId
					} }).then(() => {
						toast.success("Đã lưu");
						setEditId(void 0);
						setForm(empty);
						load();
					}),
					children: editId ? "Cập nhật" : "Thêm CSKH"
				})
			]
		})
	] });
}
//#endregion
export { SupportAdmin as component };
