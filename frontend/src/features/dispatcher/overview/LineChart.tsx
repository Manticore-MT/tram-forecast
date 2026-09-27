import React from "react";
import { cn } from "@/lib/utils";
import { fmtInt } from "../format";

export interface LineSeries {
  label: string;
  /** Index-aligned with the axis; null leaves a gap. */
  values: (number | null)[];
  color: string;
  dashed?: boolean;
  /** Thinner, secondary line. */
  quiet?: boolean;
}

export interface LineChartProps {
  series: LineSeries[];
  /** One label per period; its length sets the x axis. */
  labels: string[];
  height?: number;
  marker?: { index: number; value: number; label: string };
  ariaLabel: string;
  /** Upper bound on x-axis labels; lower it for narrow charts to avoid collisions. */
  maxTicks?: number;
}

const W = 1000;
const DEFAULT_MAX_TICKS = 8;

function x(i: number, n: number): number {
  return n > 1 ? (i / (n - 1)) * W : W / 2;
}

function linePath(values: (number | null)[], n: number, h: number, max: number): string {
  let d = "";
  let pen = false;
  values.slice(0, n).forEach((v, i) => {
    if (v === null) { pen = false; return; }
    d += `${pen ? "L" : "M"}${x(i, n)},${h - (v / max) * h} `;
    pen = true;
  });
  return d.trim();
}

export function LineLegend({ series }: { series: Pick<LineSeries, "label" | "color" | "dashed">[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {series.map((s) => (
        <span key={s.label} className="inline-flex items-center gap-1.5 text-caption text-text-muted">
          <span className="w-3.5 border-t-2" style={{ borderColor: s.color, borderStyle: s.dashed ? "dashed" : "solid" }} />
          {s.label}
        </span>
      ))}
    </div>
  );
}

/** Index-aligned line chart: SVG for the lines, HTML for text so it never stretches. */
export function LineChart({ series, labels, height = 220, marker, ariaLabel, maxTicks = DEFAULT_MAX_TICKS }: LineChartProps) {
  const n = labels.length;
  const all = series.flatMap((s) => s.values.slice(0, n).filter((v): v is number => v !== null));
  const max = Math.max(1, ...all) * 1.12;
  const step = Math.max(1, Math.ceil(n / maxTicks));
  const pct = (i: number) => (x(i, n) / W) * 100;
  const areaRef = React.useRef<HTMLDivElement>(null);
  const [hover, setHover] = React.useState<number | null>(null);

  function indexAt(clientX: number): number {
    const rect = areaRef.current!.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return n > 1 ? Math.round(frac * (n - 1)) : 0;
  }

  return (
    <div className="flex flex-col gap-2" role="img" aria-label={ariaLabel}>
      <div
        ref={areaRef}
        className="relative"
        style={{ height }}
        onMouseMove={(e) => n > 0 && setHover(indexAt(e.clientX))}
        onMouseLeave={() => setHover(null)}
      >
        {[0.25, 0.5, 0.75].map((g) => (
          <div key={g} className="absolute inset-x-0 border-t border-border-subtle" style={{ top: `${(1 - g) * 100}%` }}>
            <span className="absolute left-0 -translate-y-full rounded-sm bg-bg-surface-2 px-1 pb-0.5 text-mono-s text-text-muted">
              {fmtInt(max * g)}
            </span>
          </div>
        ))}
        <div className="absolute inset-x-0 bottom-0 border-t border-border-default" />
        <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" className="absolute inset-0 block size-full overflow-visible">
          {series.map((s) => (
            <path
              key={s.label}
              d={linePath(s.values, n, height, max)}
              fill="none"
              stroke={s.color}
              strokeWidth={s.quiet ? 1.5 : 2.5}
              strokeDasharray={s.dashed ? "6 5" : undefined}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        {hover !== null && (
          <>
            <div
              className="pointer-events-none absolute inset-y-0 w-px bg-border-default"
              style={{ left: `${pct(hover)}%` }}
            />
            {series.map((s) => {
              const v = s.values[hover];
              if (v === null || v === undefined) return null;
              return (
                <span
                  key={s.label}
                  className="pointer-events-none absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-bg-surface"
                  style={{ left: `${pct(hover)}%`, top: `${(1 - v / max) * 100}%`, background: s.color }}
                />
              );
            })}
            <div
              className="pointer-events-none absolute flex flex-col gap-1 whitespace-nowrap rounded-md bg-bg-elevated px-2.5 py-2 text-caption shadow-md ring-1 ring-border-default/10"
              style={{
                left: `${pct(hover)}%`,
                top: `${(1 - (series.find((s) => s.values[hover] != null)?.values[hover] ?? 0) / max) * 100}%`,
                transform: pct(hover) > 65 ? "translate(calc(-100% - 10px), -50%)" : "translate(10px, -50%)",
              }}
            >
              <span className="text-text-muted">{labels[hover]}</span>
              {series.map((s) => {
                const v = s.values[hover];
                if (v === null || v === undefined) return null;
                return (
                  <span key={s.label} className="flex items-center gap-1.5 tabular-nums text-text-primary">
                    <span className="size-2 shrink-0 rounded-full" style={{ background: s.color }} />
                    {s.label}: {fmtInt(v)}
                  </span>
                );
              })}
            </div>
          </>
        )}
        {marker && marker.index >= 0 && marker.index < n && (
          <div
            className="pointer-events-none absolute"
            style={{ left: `${pct(marker.index)}%`, top: `${(1 - marker.value / max) * 100}%` }}
          >
            <span className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-text-primary ring-2 ring-bg-surface" />
            <span
              className={cn(
                "absolute bottom-2 whitespace-nowrap rounded-sm bg-bg-surface-2 px-1.5 py-0.5 text-caption text-text-primary shadow-(--inset-hairline)",
                pct(marker.index) > 80 ? "right-0" : pct(marker.index) < 20 ? "left-0" : "-translate-x-1/2",
              )}
            >
              {marker.label}
            </span>
          </div>
        )}
      </div>
      <div className="relative h-4">
        {labels.map((label, i) => {
          if (i % step !== 0 && i !== n - 1) return null;
          // The last point only gets its own label if it already lands on the step grid — any
          // closer and it collides with the regular tick before it (e.g. 21:00/23:00 on a day).
          if (i === n - 1 && (n - 1) % step !== 0) return null;
          const shift = i === 0 ? "" : i === n - 1 ? "-translate-x-full" : "-translate-x-1/2";
          return (
            <span key={i} className={cn("absolute whitespace-nowrap text-caption text-text-muted", shift)} style={{ left: `${pct(i)}%` }}>
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
