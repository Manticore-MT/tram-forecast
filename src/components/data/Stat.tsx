import React from "react";

export interface StatProps {
  label?: React.ReactNode;
  value: React.ReactNode;
  unit?: React.ReactNode;
  caption?: React.ReactNode;
  /** up renders amber (worse for load), down renders green */
  trend?: { dir: "up" | "down"; value: string };
  align?: "left" | "center";
  size?: "md" | "lg";
  style?: React.CSSProperties;
}

/** Metric block — big tabular number with an uppercase eyebrow label. */
export function Stat({ label, value, unit, caption, trend, align = "left", size = "md", style, ...rest }: StatProps) {
  const trendColor = trend && trend.dir === "down" ? "var(--status-ok)" : trend && trend.dir === "up" ? "var(--status-warn)" : "var(--text-muted)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", alignItems: align === "center" ? "center" : "flex-start", textAlign: align, ...style }} {...rest}>
      {label && <span className="mt-eyebrow" style={{ font: "var(--type-eyebrow)", letterSpacing: "var(--tracking-eyebrow)", textTransform: "uppercase", color: "var(--text-muted)" }}>{label}</span>}
      <span style={{ display: "flex", alignItems: "baseline", gap: 6, font: size === "lg" ? "var(--type-metric-xl)" : "var(--type-metric)", letterSpacing: "var(--tracking-tight)", fontVariantNumeric: "tabular-nums", color: "var(--text-primary)" }}>
        {value}
        {unit && <span style={{ font: "var(--type-h4)", color: "var(--text-secondary)" }}>{unit}</span>}
      </span>
      {(caption || trend) && (
        <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", font: "var(--type-caption)", color: "var(--text-muted)" }}>
          {trend && <span style={{ color: trendColor, fontFamily: "var(--font-mono)" }}>{trend.dir === "down" ? "▼" : "▲"} {trend.value}</span>}
          {caption}
        </span>
      )}
    </div>
  );
}
