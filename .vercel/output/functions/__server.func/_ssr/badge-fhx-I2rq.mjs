import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { r as cn } from "./button-BllcHIJj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-fhx-I2rq.js
var import_jsx_runtime = require_jsx_runtime();
var styles = {
	default: "bg-secondary text-secondary-foreground",
	up: "bg-up/15 text-up",
	down: "bg-down/15 text-down",
	warn: "bg-warn/15 text-warn",
	outline: "border border-border text-muted-foreground",
	steel: "bg-steel/15 text-steel"
};
function Badge({ className, variant = "default", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", styles[variant], className),
		...props
	});
}
//#endregion
export { Badge as t };
