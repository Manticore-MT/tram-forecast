import React from "react";
import { cn } from "@/lib/utils";

export interface LoadMeterProps {
  /** 0..1 */
  value?: number;
  segments?: number;
  showLabel?: boolean;
  /** escape hatch: raw CSS width value — callers size this meter to fit arbitrary layout slots */
  width?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

const LEVELS = ["var(--load-1)", "var(--load-2)", "var(--load-3)", "var(--load-4)", "var(--load-5)"];
const NAMES = ["Свободно", "Комфортно", "Умеренно", "Плотно", "Перегружено"];

/**
 * INTENTIONAL ADDITION (domain): five-segment passenger-load indicator on the shared --load-1..5 scale.
 */
export function LoadMeter({ value = 0, showLabel = true, segments = 5, width, className, style, ...rest }: LoadMeterProps) {
  const v = Math.max(0, Math.min(1, value));
  const lit = Math.max(1, Math.ceil(v * segments));
  const idx = Math.min(LEVELS.length - 1, Math.max(0, lit - 1));
  return (
    <div className={cn("flex flex-col gap-2", className)} style={{ width, ...style }} {...rest}>
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <span key={i} className="h-2 flex-1 rounded-xs" style={{ background: i < lit ? LEVELS[Math.min(LEVELS.length - 1, i)] : "var(--ink-600)", transition: "background-color var(--dur-base) var(--ease-standard)" }} />
        ))}
      </div>
      {showLabel && (
        <div className="flex justify-between gap-3 text-caption text-text-muted">
          <span style={{ color: LEVELS[idx] }}>{NAMES[idx]}</span>
          <span className="font-mono tabular-nums">{Math.round(v * 100)}%</span>
        </div>
      )}
    </div>
  );
}
