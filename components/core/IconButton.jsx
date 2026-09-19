import React from "react";

const SIZES = { sm: 32, md: 40, lg: 48 };

export function IconButton({ icon, label, variant = "secondary", size = "md", disabled = false, onClick, style, ...rest }) {
  const d = SIZES[size] || SIZES.md;
  const [hover, setHover] = React.useState(false);
  const skin = variant === "primary"
    ? { background: "var(--accent)", color: "var(--on-accent)" }
    : variant === "ghost"
      ? { background: "transparent", color: "var(--text-secondary)" }
      : { background: "var(--glass-fill)", color: "var(--text-primary)", boxShadow: "inset 0 0 0 1px var(--border-default)" };
  return (
    <button aria-label={label} disabled={disabled} onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", width: d, height: d,
        border: "none", borderRadius: "var(--radius-pill)", cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.42 : 1, transition: "var(--transition-ui)", ...skin,
        ...(hover && !disabled ? { color: variant === "primary" ? "var(--on-accent)" : "var(--text-primary)", background: variant === "primary" ? "var(--accent-hover)" : "rgba(255,255,255,.12)" } : null),
        ...style,
      }} {...rest}>{icon}</button>
  );
}
