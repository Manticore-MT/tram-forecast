import React from "react";
import { cn } from "@/lib/utils";

export interface TagProps {
  children?: React.ReactNode;
  selected?: boolean;
  icon?: React.ReactNode;
  /** omit to render a static, non-interactive chip */
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

/** Selectable filter chip — track pickers, route filters, forecast horizons. */
export function Tag({
  children,
  selected = false,
  onClick,
  icon,
  style,
  ...rest
}: TagProps) {
  const clickable = typeof onClick === "function";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      style={style}
      className={cn(
        "inline-flex items-center gap-2 h-9 px-4",
        "text-ui-s tracking-tight rounded-pill",
        "transition-ui",
        selected
          ? "bg-bg-inverse text-text-inverse ring-0"
          : "bg-glass-fill text-text-secondary ring-1 ring-inset ring-border-subtle enabled:hover:bg-white/10",
        !clickable && "cursor-default"
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
