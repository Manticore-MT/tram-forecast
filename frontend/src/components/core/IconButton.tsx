import React from "react";
import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface IconButtonProps {
  icon: React.ReactNode;
  /** accessible name — required */
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

/** Square-footprint circular button holding one glyph. Always give it an aria label. */
export function IconButton({
  icon,
  label,
  variant = "secondary",
  size = "md",
  disabled = false,
  onClick,
  style,
  ...rest
}: IconButtonProps) {
  // Map old variant names to shadcn variants
  const shadcnVariant =
    variant === "primary" ? "default" :
    variant === "ghost" ? "ghost" :
    "outline";

  // Map old size names to Tailwind size classes (w-* h-*)
  const sizeClasses =
    size === "sm" ? "w-8 h-8" :
    size === "md" ? "w-10 h-10" :
    size === "lg" ? "w-12 h-12" :
    "w-10 h-10";

  return (
    <ShadcnButton
      variant={shadcnVariant}
      size="icon"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      style={style}
      className={cn(
        sizeClasses,
        variant === "secondary" && "border border-border bg-background hover:bg-muted hover:text-foreground"
      )}
      {...rest}
    >
      {icon}
    </ShadcnButton>
  );
}
