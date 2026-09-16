import { cn } from "@/lib/utils";

export function Logo({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
        <rect width="32" height="32" rx="8" className="fill-card stroke-border" strokeWidth="1" />
        <path d="M8 8 L16 24 L24 8" fill="none" className="stroke-steel" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M20 18 v6 M18.5 18 h3 M18.5 24 h3" className="stroke-up" strokeWidth="1.4" />
      </svg>
      {!compact && (
        <span className="text-lg font-semibold tracking-[-0.04em]">
          VERTEX
        </span>
      )}
    </div>
  );
}
