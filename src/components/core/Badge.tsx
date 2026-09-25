import React from "react";
import { Badge as ShadcnBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface BadgeProps {
  children?: React.ReactNode;
  tone?: "neutral" | "accent" | "ok" | "warn" | "danger" | "info";
  /** leading 6px dot — use for live/stream states */
  dot?: boolean;
  style?: React.CSSProperties;
}

/** Small status pill: track state, model confidence, load level, live indicators. */
export function Badge({
  children,
  tone = "neutral",
  dot = false,
  style,
  ...rest
}: BadgeProps) {
  // Map tone to Tailwind classes using brand tokens
  const toneClasses =
    tone === "neutral"
      ? "bg-glass-fill text-text-secondary ring-1 ring-border-default"
      : tone === "accent"
        ? "bg-brand-quiet text-text-accent ring-1 ring-brand/35"
        : tone === "ok"
          ? "bg-green-500/15 text-status-ok ring-1 ring-green-500/35"
          : tone === "warn"
            ? "bg-amber-500/15 text-status-warn ring-1 ring-amber-500/35"
            : tone === "danger"
              ? "bg-red-500/15 text-status-danger ring-1 ring-red-500/35"
              : tone === "info"
                ? "bg-cyan-500/15 text-status-info ring-1 ring-cyan-500/35"
                : "bg-glass-fill text-text-secondary ring-1 ring-border-default";

  return (
    <ShadcnBadge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium",
        toneClasses
      )}
      style={style}
      {...rest}
    >
      {dot && (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
      )}
      {children}
    </ShadcnBadge>
  );
}
