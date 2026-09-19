import React from "react";

export interface BadgeProps {
  children?: React.ReactNode;
  tone?: "neutral" | "accent" | "ok" | "warn" | "danger" | "info";
  /** leading 6px dot — use for live/stream states */
  dot?: boolean;
  style?: React.CSSProperties;
}

const TONES: Record<string, { bg: string; fg: string; ring: string }> = {
  neutral: { bg: "var(--glass-fill)", fg: "var(--text-secondary)", ring: "var(--border-default)" },
  accent: { bg: "var(--accent-quiet)", fg: "var(--text-accent)", ring: "rgba(240,57,43,.35)" },
  ok: { bg: "rgba(46,212,122,.14)", fg: "var(--status-ok)", ring: "rgba(46,212,122,.35)" },
  warn: { bg: "rgba(255,176,32,.14)", fg: "var(--status-warn)", ring: "rgba(255,176,32,.35)" },
  danger: { bg: "rgba(240,57,43,.14)", fg: "var(--status-danger)", ring: "rgba(240,57,43,.35)" },
  info: { bg: "rgba(34,211,238,.14)", fg: "var(--status-info)", ring: "rgba(34,211,238,.35)" },
};

/** Small status pill: track state, model confidence, load level, live indicators. */
export function Badge({ children, tone = "neutral", dot = false, style, ...rest }: BadgeProps) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "var(--space-2)", padding: "5px 10px",
      font: "var(--type-caption)", letterSpacing: "var(--tracking-tight)", borderRadius: "var(--radius-pill)",
      background: t.bg, color: t.fg, boxShadow: `inset 0 0 0 1px ${t.ring}`, ...style,
    }} {...rest}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: "var(--radius-pill)", background: "currentColor" }} />}
      {children}
    </span>
  );
}
