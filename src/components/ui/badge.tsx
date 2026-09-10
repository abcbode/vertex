import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const styles: Record<string, string> = {
  default: "bg-secondary text-secondary-foreground",
  up: "bg-up/15 text-up",
  down: "bg-down/15 text-down",
  warn: "bg-warn/15 text-warn",
  outline: "border border-border text-muted-foreground",
  steel: "bg-steel/15 text-steel",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof styles }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
