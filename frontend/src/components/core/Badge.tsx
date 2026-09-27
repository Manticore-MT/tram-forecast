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
      ? "bg-glass-fill text-text-secondary"
      : tone === "accent"
        ? "bg-brand-quiet text-text-accent"
        : tone === "ok"
          ? "bg-status-ok/15 text-status-ok"
          : tone === "warn"
            ? "bg-status-warn/15 text-status-warn"
            : tone === "danger"
              ? "bg-red-500/15 text-status-danger"
              : tone === "info"
                ? "bg-cyan-500/15 text-status-info"
                : "bg-glass-fill text-text-secondary";

  return (
    <ShadcnBadge
      variant="secondary"
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 text-ui-s leading-none",
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
