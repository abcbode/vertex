import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Logo, t as Button } from "./button-BllcHIJj.mjs";
import { t as Input } from "./input-CRLCFB24.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { M as verifyAdmin2fa } from "./admin-Bp8V99lv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/verify-CId2_Ds3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Verify() {
	const nav = useNavigate();
	const [code, setCode] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "w-full max-w-sm space-y-3 rounded-xl border border-border bg-card p-6",
			onSubmit: async (e) => {
				e.preventDefault();
				try {
					await verifyAdmin2fa({ data: { code } });
					nav({ to: "/admin" });
				} catch (err) {
					toast.error(err instanceof Error ? err.message : "Sai mã");
				}
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold",
					children: "Xác thực 2FA"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Mã 6 số",
					value: code,
					onChange: (e) => setCode(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "w-full",
					children: "Xác nhận"
				})
			]
		})
	});
}
//#endregion
export { Verify as component };
