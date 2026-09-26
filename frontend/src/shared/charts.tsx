function path(points: number[], w: number, h: number, max: number): string {
  const step = points.length > 1 ? w / (points.length - 1) : 0;
  return points.map((v, i) => `${i === 0 ? "M" : "L"}${i * step},${h - (v / max) * h}`).join(" ");
}

export interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export function Sparkline({ data, color = "var(--cyan-500)", height = 36 }: SparklineProps) {
  const max = Math.max(1, ...data) * 1.1;
  return (
    <svg viewBox={`0 0 200 ${height}`} preserveAspectRatio="none" className="block w-full" style={{ height }}>
      <path d={path(data, 200, height, max)} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export interface ForecastChartProps {
  actual: number[];
  forecast: number[];
  height?: number;
}

/** Fact (solid cyan) up to "сейчас", forecast (dashed accent) after it. */
export function ForecastChart({ actual, forecast, height = 260 }: ForecastChartProps) {
  const w = 1000;
  const h = height - 28;
  const max = Math.max(1, ...actual, ...forecast) * 1.12;
  const split = actual.length / Math.max(1, actual.length + forecast.length);
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="block w-full" style={{ height }}>
      <defs>
        <linearGradient id="forecast-chart-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--cyan-500)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--cyan-500)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((g) => <line key={g} x1="0" x2={w} y1={h * g} y2={h * g} stroke="var(--border-subtle)" strokeWidth="1" />)}
      <g transform={`translate(${w * split},0)`}>
        <line x1="0" x2="0" y1="0" y2={h} stroke="var(--border-strong)" strokeDasharray="4 4" />
        <text x="8" y="14" fill="var(--text-muted)" style={{ font: "11px var(--font-mono)" }}>сейчас</text>
      </g>
      <path d={path(actual, w * split, h, max) + ` L${w * split},${h} L0,${h} Z`} fill="url(#forecast-chart-fill)" />
      <path d={path(actual, w * split, h, max)} fill="none" stroke="var(--cyan-500)" strokeWidth="2.5" />
      <g transform={`translate(${w * split},0)`}>
        <path d={path(forecast, w * (1 - split), h, max)} fill="none" stroke="var(--brand-accent)" strokeWidth="2.5" strokeDasharray="6 5" />
      </g>
    </svg>
  );
}
