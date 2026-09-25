import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps {
  children?: React.ReactNode;
  tone?: "surface" | "raised" | "glass" | "accent" | "outline";
  /** use the pin silhouette: three 40px corners + one 6px corner */
  pin?: boolean;
  /** escape hatch: raw CSS value (e.g. "var(--space-4)", "8px 16px") — Tailwind's padding scale can't express asymmetric or token-driven padding in one prop */
  padding?: string;
  /** lift 2px on hover */
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

/** Rounded container. The dark system expresses elevation as a lighter fill + hairline, not shadow. */
export function Card({
  children,
  tone = "surface",
  pin = false,
  padding = "var(--space-6)",
  interactive = false,
  className,
  style,
  onClick,
  ...rest
}: CardProps) {
  const toneClasses =
    tone === "surface"
      ? "bg-bg-surface ring-1 ring-inset ring-border-default"
      : tone === "raised"
        ? "bg-bg-surface-2 ring-1 ring-inset ring-border-default shadow-md"
        : tone === "glass"
          ? "bg-glass-fill ring-1 ring-inset ring-glass-stroke backdrop-blur-[16px]"
          : tone === "accent"
            ? "bg-brand text-on-accent"
            : tone === "outline"
              ? "bg-transparent ring-1 ring-inset ring-border-default"
              : "bg-bg-surface ring-1 ring-inset ring-border-default";

  const radiusClass = pin ? "rounded-pin" : "rounded-xl";

  return (
    <div
      onClick={onClick}
      style={{ padding, ...style }}
      className={cn(
        radiusClass,
        "transition-ui",
        toneClasses,
        interactive && "hover:shadow-lg hover:ring-border-strong hover:-translate-y-0.5",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
