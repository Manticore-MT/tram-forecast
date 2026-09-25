import React from "react";
import { cn } from "@/lib/utils";

export interface StatProps {
  label?: React.ReactNode;
  value: React.ReactNode;
  unit?: React.ReactNode;
  caption?: React.ReactNode;
  /** up renders amber (worse for load), down renders green */
  trend?: { dir: "up" | "down"; value: string };
  /** colors the value itself with a status token — same vocabulary as Badge's tone */
  tone?: "ok" | "warn" | "danger";
  align?: "left" | "center";
  size?: "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
}

const TONE_COLOR: Record<string, string> = { ok: "var(--status-ok)", warn: "var(--status-warn)", danger: "var(--status-danger)" };

/** Metric block — big tabular number with an uppercase eyebrow label. */
export function Stat({ label, value, unit, caption, trend, tone, align = "left", size = "md", className, style, ...rest }: StatProps) {
  const trendColor = trend && trend.dir === "down" ? "var(--status-ok)" : trend && trend.dir === "up" ? "var(--status-warn)" : "var(--text-muted)";
  return (
    <div className={cn("flex flex-col gap-2", align === "center" ? "items-center text-center" : "items-start text-left", className)} style={style} {...rest}>
      {label && <span className="text-eyebrow text-text-muted">{label}</span>}
      <span className={cn("flex items-baseline gap-1.5 tabular-nums", size === "lg" ? "text-metric-xl" : "text-metric", tone ? "" : "text-text-primary")} style={{ color: tone ? TONE_COLOR[tone] : undefined }}>
        {value}
        {unit && <span className="text-h4 text-text-secondary">{unit}</span>}
      </span>
      {(caption || trend) && (
        <span className="flex items-center gap-2 text-caption text-text-muted">
          {trend && <span className="font-mono" style={{ color: trendColor }}>{trend.dir === "down" ? "▼" : "▲"} {trend.value}</span>}
          {caption}
        </span>
      )}
    </div>
  );
}
