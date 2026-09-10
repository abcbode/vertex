import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as STATUS_LABEL, u as vnd } from "./format-Bc8Vy2YH.mjs";
import { t as Button } from "./button-BllcHIJj.mjs";
import { t as Input } from "./input-CRLCFB24.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { l as listAdminDeposits, y as reviewDeposit } from "./admin-Bp8V99lv.mjs";
import { t as AdminShell } from "./admin-shell-5m9sW_mQ.mjs";
import { t as Badge } from "./badge-fhx-I2rq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/deposits-BeUpIV-4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Deposits() {
	const [status, setStatus] = (0, import_react.useState)("pending");
	const [q, setQ] = (0, import_react.useState)("");
	const [page, setPage] = (0, import_react.useState)(1);
	const [data, setData] = (0, import_react.useState)(null);
	function load() {
		listAdminDeposits({ data: {
			page,
			status,
			q
		} }).then(setData).catch((e) => toast.error(String(e)));
	}
	(0, import_react.useEffect)(() => {
		load();
	}, [
		status,
		q,
		page
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mb-4 text-xl font-semibold",
			children: "Nạp tiền"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex flex-wrap gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "Email / nội dung / ID",
				value: q,
				onChange: (e) => setQ(e.target.value),
				className: "max-w-xs"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				className: "h-11 rounded-md border border-input bg-background px-3 text-sm",
				value: status,
				onChange: (e) => setStatus(e.target.value),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "all",
						children: "Tất cả"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "pending",
						children: "Chờ duyệt"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "approved",
						children: "Thành công"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "rejected",
						children: "Từ chối"
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto rounded-xl border border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-muted text-left text-xs text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "p-2",
							children: "ID"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "p-2",
							children: "User"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "p-2",
							children: "Số tiền"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "p-2",
							children: "Nội dung"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "p-2",
							children: "Trạng thái"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "p-2" })
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: (data?.rows ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-2 font-mono",
							children: r.id
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-2",
							children: r.email
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-2 font-mono",
							children: vnd(r.amount)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-2 font-mono text-xs",
							children: r.content
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: STATUS_LABEL[r.status] })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-2",
							children: r.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "up",
									onClick: () => reviewDeposit({ data: {
										id: r.id,
										action: "approve"
									} }).then(load),
									children: "Duyệt"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "down",
									onClick: () => reviewDeposit({ data: {
										id: r.id,
										action: "reject"
									} }).then(load),
									children: "Từ chối"
								})]
							})
						})
					]
				}, r.id)) })]
			})
		})
	] });
}
//#endregion
export { Deposits as component };
