import React from "react";

export interface LoadMeterProps {
  /** 0..1 */
  value?: number;
  segments?: number;
  showLabel?: boolean;
  width?: number | string;
  style?: React.CSSProperties;
}

const LEVELS = ["var(--load-1)", "var(--load-2)", "var(--load-3)", "var(--load-4)", "var(--load-5)"];
const NAMES = ["Свободно", "Комфортно", "Умеренно", "Плотно", "Перегружено"];

/**
 * INTENTIONAL ADDITION (domain): five-segment passenger-load indicator on the shared --load-1..5 scale.
 */
export function LoadMeter({ value = 0, showLabel = true, segments = 5, width, style, ...rest }: LoadMeterProps) {
  const v = Math.max(0, Math.min(1, value));
  const lit = Math.max(1, Math.ceil(v * segments));
  const idx = Math.min(LEVELS.length - 1, Math.max(0, lit - 1));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", width, ...style }} {...rest}>
      <div style={{ display: "flex", gap: 3 }}>
        {Array.from({ length: segments }).map((_, i) => (
          <span key={i} style={{ flex: 1, height: 8, borderRadius: 2, background: i < lit ? LEVELS[Math.min(LEVELS.length - 1, i)] : "var(--ink-600)", transition: "background-color var(--dur-base) var(--ease-standard)" }} />
        ))}
      </div>
      {showLabel && (
        <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-3)", font: "var(--type-caption)", color: "var(--text-muted)" }}>
          <span style={{ color: LEVELS[idx] }}>{NAMES[idx]}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{Math.round(v * 100)}%</span>
        </div>
      )}
    </div>
  );
}
