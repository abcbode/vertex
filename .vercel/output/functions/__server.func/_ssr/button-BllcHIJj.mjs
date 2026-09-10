import { o as require_jsx_runtime, r as Slot } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-BllcHIJj.js
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Logo({ compact, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex items-center gap-2", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 32 32",
			className: "size-8 shrink-0",
			"aria-hidden": true,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					width: "32",
					height: "32",
					rx: "8",
					className: "fill-card stroke-border",
					strokeWidth: "1"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M8 8 L16 24 L24 8",
					fill: "none",
					className: "stroke-steel",
					strokeWidth: "2.4",
					strokeLinejoin: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M20 18 v6 M18.5 18 h3 M18.5 24 h3",
					className: "stroke-up",
					strokeWidth: "1.4"
				})
			]
		}), !compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-lg font-semibold tracking-[-0.04em]",
			children: "VERTEX"
		})]
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[opacity,transform,background-color,color] duration-150 ease-out disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] [&_svg]:size-4", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:opacity-90",
			secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
			outline: "border border-border bg-transparent hover:bg-accent",
			ghost: "hover:bg-accent",
			destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
			up: "bg-up text-up-fg hover:opacity-90",
			down: "bg-down text-down-fg hover:opacity-90"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-xs",
			lg: "h-12 px-5",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
//#endregion
export { Logo as n, cn as r, Button as t };
