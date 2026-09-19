import React from "react";

export function Card({ children, tone = "surface", pin = false, padding = "var(--space-6)", interactive = false, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const tones = {
    surface: { background: "var(--bg-surface)", boxShadow: "var(--inset-hairline)" },
    raised: { background: "var(--bg-surface-2)", boxShadow: "var(--inset-hairline-strong), var(--shadow-md)" },
    glass: { background: "var(--glass-fill)", backdropFilter: "var(--blur-glass)", boxShadow: "inset 0 0 0 1px var(--glass-stroke)" },
    accent: { background: "var(--accent)", color: "var(--on-accent)", boxShadow: "none" },
    outline: { background: "transparent", boxShadow: "inset 0 0 0 1px var(--border-default)" },
  };
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: pin ? "var(--radius-pin)" : "var(--radius-xl)", padding, transition: "var(--transition-ui)",
        ...(tones[tone] || tones.surface),
        ...(interactive && hover ? { transform: "translateY(-2px)", boxShadow: "var(--inset-hairline-strong), var(--shadow-lg)" } : null),
        ...style,
      }} {...rest}>{children}</div>
  );
}
