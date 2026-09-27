import React from "react";
import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ButtonProps {
  children?: React.ReactNode;
  /** primary = signal red; secondary = hairline glass; ghost = text only; inverse = white on dark */
  variant?: "primary" | "secondary" | "ghost" | "inverse";
  size?: "sm" | "md" | "lg";
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  disabled?: boolean;
  /** full-width — used in mobile sticky footers */
  block?: boolean;
  as?: "button" | "a";
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

/** Primary call-to-action pill. "Принять участие" on marketing, "Построить прогноз" in product. */
export function Button({
  children,
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  disabled = false,
  block = false,
  as = "button",
  href,
  onClick,
  style,
  ...rest
}: ButtonProps) {
  // Map old variant names to shadcn variants
  const shadcnVariant =
    variant === "primary" ? "default" :
    variant === "secondary" ? "outline" :
    variant === "ghost" ? "ghost" :
    variant === "inverse" ? "default" : "default";

  // Map old size names to Tailwind classes for height precision
  const sizeClasses =
    size === "sm" ? "h-9" :
    size === "md" ? "h-11" :
    size === "lg" ? "h-14" :
    "h-11";

  // For inverse variant, override with bg-bg-page text-text-primary
  const variantClasses =
    variant === "inverse" ? "bg-bg-page text-text-primary hover:bg-bg-page/90" : "";

  const blockClasses = block ? "w-full" : "";

  if (as === "a" && href) {
    return (
      <a
        href={href}
        onClick={onClick}
        style={style}
        className={cn(
          "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-focus-ring focus-visible:ring-3 focus-visible:ring-focus-ring/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 gap-2",
          sizeClasses,
          shadcnVariant === "default" && "bg-brand text-on-accent hover:bg-brand/80",
          shadcnVariant === "outline" && "border-border-default bg-bg-page hover:bg-bg-surface-2 hover:text-text-primary",
          shadcnVariant === "ghost" && "hover:bg-bg-surface-2 hover:text-text-primary",
          variantClasses,
          blockClasses,
          "disabled:pointer-events-none disabled:opacity-50"
        )}
        {...rest}
      >
        {iconLeft}
        {children}
        {iconRight}
      </a>
    );
  }

  return (
    <ShadcnButton
      variant={shadcnVariant}
      size="default"
      disabled={disabled}
      onClick={onClick}
      style={style}
      className={cn(sizeClasses, variantClasses, blockClasses)}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </ShadcnButton>
  );
}
