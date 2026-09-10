import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { _ as prepareAdminLogin, t as adminPing } from "./admin-Bp8V99lv.mjs";
import { t as AdminLoginForm } from "./admin-login-form-i21d4EBD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-CcpwSZNJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminLogin() {
	const { user, isPending } = useCurrentUserState();
	const [alreadyAdmin, setAlreadyAdmin] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		prepareAdminLogin().catch(() => {});
	}, []);
	(0, import_react.useEffect)(() => {
		if (isPending || !user) return;
		adminPing().then((p) => {
			if (p.isAdmin && p.twoFaOk) setAlreadyAdmin(true);
		}).catch(() => {});
	}, [user, isPending]);
	if (alreadyAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/admin" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLoginForm, {});
}
//#endregion
export { AdminLogin as component };
