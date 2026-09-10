import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-BllcHIJj.mjs";
import { a as listSupportPublic } from "./cms-PRMuySGH.mjs";
import { d as Phone, f as MessageCircle, l as Send } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./app-shell-D1i_Vq6F.mjs";
import { n as CardContent, t as Card } from "./card-BKV4ShhV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/support-Cm0WKS8C.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SupportPage() {
	const [rows, setRows] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		listSupportPublic().then(setRows).catch(() => {});
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		requireAuth: false,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-xl space-y-4 p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold",
					children: "Chăm sóc khách hàng"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Liên hệ trực tiếp qua Telegram, Zalo hoặc điện thoại."
				}),
				rows.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex gap-4 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid size-12 shrink-0 place-items-center rounded-full bg-muted text-lg font-medium",
						children: a.name.slice(0, 1)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-medium",
								children: a.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: a.bio
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap gap-2",
								children: [
									a.telegram && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										asChild: true,
										size: "sm",
										variant: "outline",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: a.telegram,
											target: "_blank",
											rel: "noreferrer",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-3" }), " Telegram"]
										})
									}),
									a.zalo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										asChild: true,
										size: "sm",
										variant: "outline",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: a.zalo,
											target: "_blank",
											rel: "noreferrer",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-3" }), " Zalo"]
										})
									}),
									a.messenger && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										asChild: true,
										size: "sm",
										variant: "outline",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											href: a.messenger,
											target: "_blank",
											rel: "noreferrer",
											children: "Messenger"
										})
									}),
									a.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										asChild: true,
										size: "sm",
										variant: "outline",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: `tel:${a.phone}`,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-3" }),
												" ",
												a.phone
											]
										})
									})
								]
							})
						]
					})]
				}) }, a.id))
			]
		})
	});
}
//#endregion
export { SupportPage as component };
