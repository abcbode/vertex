import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { c as timeAgo } from "./format-Bc8Vy2YH.mjs";
import { r as cn } from "./button-BllcHIJj.mjs";
import { n as listNotifications, o as markRead } from "./cms-PRMuySGH.mjs";
import { t as AppShell } from "./app-shell-D1i_Vq6F.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications-Bp0Vy5o3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function NotiPage() {
	const [rows, setRows] = (0, import_react.useState)([]);
	function load() {
		listNotifications().then(setRows).catch(() => {});
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl space-y-3 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-xl font-semibold",
				children: "Thông báo"
			}),
			rows.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => {
					if (!n.read) markRead({ data: { id: n.id } }).then(load).catch(() => {});
				},
				className: cn("w-full rounded-xl border border-border p-4 text-left", !n.read && "border-ring"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-medium",
						children: n.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: timeAgo(n.createdAt)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: n.body
				})]
			}, n.id)),
			rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Chưa có thông báo."
			})
		]
	}) });
}
//#endregion
export { NotiPage as component };
