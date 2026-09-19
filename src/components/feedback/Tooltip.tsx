import React from "react";

export interface TooltipProps {
  children?: React.ReactNode;
  content: React.ReactNode;
  placement?: "top" | "bottom";
  style?: React.CSSProperties;
}

/** Hover label for icon-only controls and chart points. Single line, no rich content. */
export function Tooltip({ children, content, placement = "top", style, ...rest }: TooltipProps) {
  const [on, setOn] = React.useState(false);
  const pos = placement === "bottom" ? { top: "calc(100% + 8px)" } : { bottom: "calc(100% + 8px)" };
  return (
    <span style={{ position: "relative", display: "inline-flex", ...style }}
      onMouseEnter={() => setOn(true)} onMouseLeave={() => setOn(false)} {...rest}>
      {children}
      {on && (
        <span role="tooltip" style={{
          position: "absolute", left: "50%", transform: "translateX(-50%)", ...pos,
          padding: "8px 10px", whiteSpace: "nowrap", font: "var(--type-caption)", color: "var(--text-primary)",
          background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)",
          boxShadow: "var(--inset-hairline-strong), var(--shadow-md)", zIndex: 40, pointerEvents: "none",
        }}>{content}</span>
      )}
    </span>
  );
}
