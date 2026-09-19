import React from "react";

export interface TagProps {
  children?: React.ReactNode;
  selected?: boolean;
  icon?: React.ReactNode;
  /** omit to render a static, non-interactive chip */
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

/** Selectable filter chip — track pickers, route filters, forecast horizons. */
export function Tag({ children, selected = false, onClick, icon, style, ...rest }: TagProps) {
  const [hover, setHover] = React.useState(false);
  const clickable = typeof onClick === "function";
  return (
    <button type="button" onClick={onClick} disabled={!clickable}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: "var(--space-2)", height: 36, padding: "0 16px",
        font: "var(--type-ui-s)", letterSpacing: "var(--tracking-tight)", border: "none",
        borderRadius: "var(--radius-pill)", cursor: clickable ? "pointer" : "default",
        transition: "var(--transition-ui)",
        background: selected ? "var(--bg-inverse)" : hover && clickable ? "rgba(255,255,255,.10)" : "var(--glass-fill)",
        color: selected ? "var(--text-inverse)" : "var(--text-secondary)",
        boxShadow: selected ? "none" : "inset 0 0 0 1px var(--border-subtle)", ...style,
      }} {...rest}>{icon}{children}</button>
  );
}
