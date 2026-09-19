import React from "react";

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

const SIZES = {
  sm: { h: 36, px: 14, font: "var(--type-ui-s)", icon: 16 },
  md: { h: 44, px: 20, font: "var(--type-ui)", icon: 18 },
  lg: { h: 56, px: 28, font: "600 16px/1 var(--font-sans)", icon: 20 },
};

function variantStyle(variant: NonNullable<ButtonProps["variant"]>): React.CSSProperties {
  switch (variant) {
    case "secondary":
      return { background: "var(--glass-fill)", color: "var(--text-primary)", boxShadow: "inset 0 0 0 1px var(--border-default)" };
    case "ghost":
      return { background: "transparent", color: "var(--text-secondary)", boxShadow: "none" };
    case "inverse":
      return { background: "var(--bg-inverse)", color: "var(--text-inverse)", boxShadow: "none" };
    default:
      return { background: "var(--accent)", color: "var(--on-accent)", boxShadow: "var(--shadow-accent)" };
  }
}

/** Primary call-to-action pill. "Принять участие" on marketing, "Построить прогноз" in product. */
export function Button({ children, variant = "primary", size = "md", iconLeft, iconRight, disabled = false, block = false, as = "button", href, onClick, style, ...rest }: ButtonProps) {
  const s = SIZES[size] || SIZES.md;
  const Tag = as === "a" ? "a" : "button";
  const base: React.CSSProperties = {
    display: block ? "flex" : "inline-flex", width: block ? "100%" : "auto", alignItems: "center", justifyContent: "center",
    gap: "var(--space-2)", height: s.h, padding: `0 ${s.px}px`, font: s.font, letterSpacing: "var(--tracking-tight)",
    border: "none", borderRadius: "var(--radius-pill)", cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.42 : 1, transition: "var(--transition-ui)", textDecoration: "none", whiteSpace: "nowrap",
    ...variantStyle(variant), ...style,
  };
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const hoverStyle = disabled || !hover ? null : variant === "primary" ? { background: "var(--accent-hover)" } : variant === "ghost" ? { background: "var(--glass-fill)", color: "var(--text-primary)" } : variant === "secondary" ? { boxShadow: "inset 0 0 0 1px var(--border-strong)" } : { opacity: 0.88 };
  return (
    <Tag href={href} onClick={disabled ? undefined : onClick} disabled={Tag === "button" ? disabled : undefined}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)} onMouseUp={() => setPress(false)}
      style={{ ...base, ...hoverStyle, transform: press && !disabled ? "scale(var(--press-scale))" : "none" }} {...rest}>
      {iconLeft}{children}{iconRight}
    </Tag>
  );
}
