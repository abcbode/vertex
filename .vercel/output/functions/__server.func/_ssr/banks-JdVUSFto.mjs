import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { r as VN_BANKS } from "./format-Bc8Vy2YH.mjs";
import { t as Button } from "./button-BllcHIJj.mjs";
import { t as Input } from "./input-CRLCFB24.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { S as saveBank, f as listBanksAdmin, k as toggleBank } from "./admin-Bp8V99lv.mjs";
import { t as AdminShell } from "./admin-shell-5m9sW_mQ.mjs";
import { t as Badge } from "./badge-fhx-I2rq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/banks-JdVUSFto.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Banks() {
	const [rows, setRows] = (0, import_react.useState)([]);
	const [form, setForm] = (0, import_react.useState)({
		bankName: "Vietcombank",
		bankCode: "970436",
		accountNumber: "",
		accountName: "",
		branch: ""
	});
	function load() {
		listBanksAdmin().then(setRows).catch((e) => toast.error(String(e)));
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mb-4 text-xl font-semibold",
			children: "Tài khoản ngân hàng nhận"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: rows.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-medium",
					children: [
						b.bankName,
						" ",
						b.isDefault && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Mặc định" })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-mono text-xs",
					children: [
						b.accountNumber,
						" · ",
						b.accountName
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => toggleBank({ data: {
								id: b.id,
								field: "active"
							} }).then(load),
							children: b.isActive ? "Tắt" : "Bật"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => toggleBank({ data: {
								id: b.id,
								field: "default"
							} }).then(load),
							children: "Mặc định"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => toggleBank({ data: {
								id: b.id,
								field: "delete"
							} }).then(load),
							children: "Xóa"
						})
					]
				})]
			}, b.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid gap-2 rounded-xl border border-border p-4 sm:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: "h-11 rounded-md border border-input bg-background px-3 text-sm sm:col-span-2",
					value: form.bankCode,
					onChange: (e) => {
						const b = VN_BANKS.find((x) => x.code === e.target.value);
						setForm({
							...form,
							bankCode: e.target.value,
							bankName: b?.name ?? form.bankName
						});
					},
					children: VN_BANKS.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: b.code,
						children: b.name
					}, b.code))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Số TK",
					value: form.accountNumber,
					onChange: (e) => setForm({
						...form,
						accountNumber: e.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Chủ TK",
					value: form.accountName,
					onChange: (e) => setForm({
						...form,
						accountName: e.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Chi nhánh",
					value: form.branch,
					onChange: (e) => setForm({
						...form,
						branch: e.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => saveBank({ data: form }).then(() => {
						toast.success("Đã lưu");
						load();
					}),
					children: "Thêm"
				})
			]
		})
	] });
}
//#endregion
export { Banks as component };
