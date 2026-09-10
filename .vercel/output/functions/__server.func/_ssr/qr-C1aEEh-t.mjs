import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-BllcHIJj.mjs";
import { t as Input } from "./input-CRLCFB24.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as toggleQr, C as saveQr, f as listBanksAdmin, m as listQrAdmin, o as getSettings, w as saveSettings } from "./admin-Bp8V99lv.mjs";
import { t as AdminShell } from "./admin-shell-5m9sW_mQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/qr-C1aEEh-t.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function QrPage() {
	const [rows, setRows] = (0, import_react.useState)([]);
	const [banks, setBanks] = (0, import_react.useState)([]);
	const [label, setLabel] = (0, import_react.useState)("QR");
	const [imageUrl, setImageUrl] = (0, import_react.useState)("");
	const [bankId, setBankId] = (0, import_react.useState)(null);
	const [prefix, setPrefix] = (0, import_react.useState)("VERTEX");
	function load() {
		listQrAdmin().then(setRows).catch((e) => toast.error(String(e)));
		listBanksAdmin().then(setBanks).catch(() => {});
		getSettings().then((s) => setPrefix(s.transfer_prefix ?? "VERTEX")).catch(() => {});
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mb-4 text-xl font-semibold",
			children: "QR Code"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: prefix,
				onChange: (e) => setPrefix(e.target.value)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => saveSettings({ data: { transfer_prefix: prefix } }).then(() => toast.success("Đã lưu nội dung CK")),
				children: "Nội dung CK mặc định"
			})]
		}),
		rows.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-center justify-between gap-3 rounded-xl border border-border p-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [q.imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: q.imageUrl,
					alt: "",
					className: "size-16 rounded-md object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid size-16 place-items-center rounded-md bg-muted text-xs",
					children: "VietQR"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-medium",
					children: q.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted-foreground",
					children: q.isActive ? "Bật" : "Tắt"
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: () => toggleQr({ data: { id: q.id } }).then(load),
					children: q.isActive ? "Tắt" : "Bật"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: () => toggleQr({ data: {
						id: q.id,
						del: true
					} }).then(load),
					children: "Xóa"
				})]
			})]
		}, q.id)),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 space-y-2 rounded-xl border border-border p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Nhãn",
					value: label,
					onChange: (e) => setLabel(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "h-11 w-full rounded-md border border-input bg-background px-3 text-sm",
					value: bankId ?? "",
					onChange: (e) => setBankId(e.target.value ? Number(e.target.value) : null),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "Không gắn NH"
					}), banks.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value: b.id,
						children: [
							b.bankName,
							" ",
							b.accountNumber
						]
					}, b.id))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "URL ảnh QR (để trống = VietQR tự sinh)",
					value: imageUrl,
					onChange: (e) => setImageUrl(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "file",
					accept: "image/*",
					onChange: (e) => {
						const f = e.target.files?.[0];
						if (!f) return;
						const r = new FileReader();
						r.onload = () => setImageUrl(String(r.result));
						r.readAsDataURL(f);
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => saveQr({ data: {
						label,
						imageUrl,
						bankAccountId: bankId
					} }).then(() => {
						toast.success("Đã thêm");
						load();
					}),
					children: "Thêm QR"
				})
			]
		})
	] });
}
//#endregion
export { QrPage as component };
