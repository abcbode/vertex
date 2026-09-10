import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { r as cn } from "./button-BllcHIJj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/input-CRLCFB24.js
var import_jsx_runtime = require_jsx_runtime();
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-[box-shadow,border-color] duration-150 placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-50", className),
		...props
	});
}
//#endregion
export { Input as t };
