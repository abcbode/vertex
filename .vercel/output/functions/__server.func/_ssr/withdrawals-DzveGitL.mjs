import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as STATUS_LABEL, u as vnd } from "./format-Bc8Vy2YH.mjs";
import { t as Button } from "./button-BllcHIJj.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { b as reviewWithdraw, u as listAdminWithdrawals } from "./admin-Bp8V99lv.mjs";
import { t as AdminShell } from "./admin-shell-5m9sW_mQ.mjs";
import { t as Badge } from "./badge-fhx-I2rq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/withdrawals-DzveGitL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Withdrawals() {
	const [status, setStatus] = (0, import_react.useState)("pending");
	const [page, setPage] = (0, import_react.useState)(1);
	const [data, setData] = (0, import_react.useState)(null);
	function load() {
		listAdminWithdrawals({ data: {
			page,
			status
		} }).then(setData).catch((e) => toast.error(String(e)));
	}
	(0, import_react.useEffect)(() => {
		load();
	}, [status, page]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mb-4 text-xl font-semibold",
			children: "Rút tiền"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
			className: "mb-3 h-11 rounded-md border border-input bg-background px-3 text-sm",
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
					children: "Đã duyệt"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "paid",
					children: "Đã thanh toán"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "rejected",
					children: "Từ chối"
				})
			]
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
							children: "User"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "p-2",
							children: "Nhận"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "p-2",
							children: "Số tiền"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "p-2",
							children: "TT"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "p-2" })
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: (data?.rows ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-2",
							children: r.email
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "p-2 text-xs",
							children: [
								r.bankName,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								r.accountNumber,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								r.accountName
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-2 font-mono",
							children: vnd(r.amount)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: STATUS_LABEL[r.status] })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "p-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-1",
								children: [
									r.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "up",
										onClick: () => reviewWithdraw({ data: {
											id: r.id,
											action: "approve"
										} }).then(load),
										children: "Duyệt"
									}),
									(r.status === "pending" || r.status === "approved") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										onClick: () => reviewWithdraw({ data: {
											id: r.id,
											action: "paid"
										} }).then(load),
										children: "Đã trả"
									}),
									(r.status === "pending" || r.status === "approved") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "down",
										onClick: () => reviewWithdraw({ data: {
											id: r.id,
											action: "reject"
										} }).then(load),
										children: "Từ chối"
									})
								]
							})
						})
					]
				}, r.id)) })]
			})
		})
	] });
}
//#endregion
export { Withdrawals as component };
