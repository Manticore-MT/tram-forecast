import React from "react";

export interface CardProps {
  children?: React.ReactNode;
  tone?: "surface" | "raised" | "glass" | "accent" | "outline";
  /** use the pin silhouette: three 40px corners + one 6px corner */
  pin?: boolean;
  padding?: string;
  /** lift 2px on hover */
  interactive?: boolean;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

const TONES: Record<string, React.CSSProperties> = {
  surface: { background: "var(--bg-surface)", boxShadow: "var(--inset-hairline)" },
  raised: { background: "var(--bg-surface-2)", boxShadow: "var(--inset-hairline-strong), var(--shadow-md)" },
  glass: { background: "var(--glass-fill)", backdropFilter: "var(--blur-glass)", boxShadow: "inset 0 0 0 1px var(--glass-stroke)" },
  accent: { background: "var(--accent)", color: "var(--on-accent)", boxShadow: "none" },
  outline: { background: "transparent", boxShadow: "inset 0 0 0 1px var(--border-default)" },
};

/** Rounded container. The dark system expresses elevation as a lighter fill + hairline, not shadow. */
export function Card({ children, tone = "surface", pin = false, padding = "var(--space-6)", interactive = false, style, ...rest }: CardProps) {
  const [hover, setHover] = React.useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: pin ? "var(--radius-pin)" : "var(--radius-xl)", padding, transition: "var(--transition-ui)",
        ...(TONES[tone] || TONES.surface),
        ...(interactive && hover ? { transform: "translateY(-2px)", boxShadow: "var(--inset-hairline-strong), var(--shadow-lg)" } : null),
        ...style,
      }} {...rest}>{children}</div>
  );
}
