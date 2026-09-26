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
}

const W = 1000;
const MAX_TICKS = 8;

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
export function LineChart({ series, labels, height = 220, marker, ariaLabel }: LineChartProps) {
  const n = labels.length;
  const all = series.flatMap((s) => s.values.slice(0, n).filter((v): v is number => v !== null));
  const max = Math.max(1, ...all) * 1.12;
  const step = Math.max(1, Math.ceil(n / MAX_TICKS));
  const pct = (i: number) => (x(i, n) / W) * 100;

  return (
    <div className="flex flex-col gap-2" role="img" aria-label={ariaLabel}>
      <div className="relative" style={{ height }}>
        {[0.25, 0.5, 0.75].map((g) => (
          <div key={g} className="absolute inset-x-0 border-t border-border-subtle" style={{ top: `${(1 - g) * 100}%` }}>
            <span className="absolute left-0 -translate-y-full pb-0.5 text-mono-s text-text-muted">{fmtInt(max * g)}</span>
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
          if (i === n - 1 && i % step !== 0 && (n - 1) % step < step / 2) return null;
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
