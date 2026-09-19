// Lightweight SVG charts. Data is synthetic but shaped like tram validation counts.
export function seedSeries(seed: number, n: number, base: number, amp: number): number[] {
  const out: number[] = [];
  let x = seed;
  for (let i = 0; i < n; i++) {
    x = (x * 9301 + 49297) % 233280;
    const hour = (i / n) * 24;
    const peak = Math.exp(-Math.pow((hour - 8.5) / 2, 2)) + 0.92 * Math.exp(-Math.pow((hour - 18.5) / 2.2, 2));
    out.push(Math.max(0, base + amp * peak + (x / 233280 - 0.5) * amp * 0.18));
  }
  return out;
}

function path(points: number[], w: number, h: number, max: number): string {
  return points.map((v, i) => `${i === 0 ? "M" : "L"}${(i / (points.length - 1)) * w},${h - (v / max) * h}`).join(" ");
}

export interface ForecastChartProps {
  actual: number[];
  forecast: number[];
  band?: number[] | null;
  height?: number;
}

export function ForecastChart({ actual, forecast, band, height = 260 }: ForecastChartProps) {
  const w = 1000, h = height - 28;
  const max = Math.max(...actual, ...forecast) * 1.12;
  const upper = band ? forecast.map((v, i) => v * (1 + band[i])) : null;
  const lower = band ? forecast.map((v, i) => v * (1 - band[i])) : null;
  const split = actual.length / (actual.length + forecast.length);
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ width: "100%", height, display: "block" }}>
      <defs>
        <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--cyan-500)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--cyan-500)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((g) => <line key={g} x1="0" x2={w} y1={h * g} y2={h * g} stroke="var(--border-subtle)" strokeWidth="1" />)}
      <g transform={`translate(${w * split},0)`}>
        <line x1="0" x2="0" y1="0" y2={h} stroke="var(--border-strong)" strokeDasharray="4 4" />
        <text x="8" y="14" fill="var(--text-muted)" style={{ font: "11px var(--font-mono)" }}>сейчас</text>
      </g>
      <g transform={`translate(0,0)`}>
        <path d={path(actual, w * split, h, max) + ` L${w * split},${h} L0,${h} Z`} fill="url(#fg)" />
        <path d={path(actual, w * split, h, max)} fill="none" stroke="var(--cyan-500)" strokeWidth="2.5" />
      </g>
      <g transform={`translate(${w * split},0)`}>
        {upper && lower && <path d={`${path(upper, w * (1 - split), h, max)} L${w * (1 - split)},${h - (lower[lower.length - 1] / max) * h} ${lower.slice().reverse().map((v, i) => `L${w * (1 - split) - (i / (lower.length - 1)) * w * (1 - split)},${h - (v / max) * h}`).join(" ")} Z`} fill="var(--accent)" fillOpacity="0.14" />}
        <path d={path(forecast, w * (1 - split), h, max)} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeDasharray="6 5" />
      </g>
      <g>{["06:00", "10:00", "14:00", "18:00", "22:00"].map((t, i) => <text key={t} x={(i / 4) * (w - 40) + 4} y={height - 6} fill="var(--text-muted)" style={{ font: "11px var(--font-mono)" }}>{t}</text>)}</g>
    </svg>
  );
}

export interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export function Sparkline({ data, color = "var(--cyan-500)", height = 36 }: SparklineProps) {
  const max = Math.max(...data) * 1.1;
  return (
    <svg viewBox={`0 0 200 ${height}`} preserveAspectRatio="none" style={{ width: "100%", height, display: "block" }}>
      <path d={path(data, 200, height, max)} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export const LOAD_VARS = ["var(--load-1)", "var(--load-2)", "var(--load-3)", "var(--load-4)", "var(--load-5)"];

export interface HeatmapProps {
  rows: { label: string; values: number[] }[];
  cols?: number;
}

export function Heatmap({ rows, cols = 24 }: HeatmapProps) {
  return (
    <div style={{ display: "grid", gap: 3 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: `120px repeat(${cols},1fr)`, gap: 3, alignItems: "center" }}>
          <span style={{ font: "var(--type-mono-s)", color: "var(--text-muted)" }}>{r.label}</span>
          {r.values.slice(0, cols).map((v, j) => (
            <span key={j} title={`${r.label} · ${j}:00 · ${Math.round(v * 100)}%`}
              style={{ height: 18, borderRadius: 2, background: LOAD_VARS[Math.min(4, Math.floor(v * 5))], opacity: 0.35 + v * 0.65 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export interface Stop {
  name: string;
  load: number;
}

export interface RouteStripProps {
  stops: Stop[];
  active: number;
  onPick?: (i: number) => void;
}

/** Schematic route strip — deliberately NOT a geographic map: no real geometry was supplied. */
export function RouteStrip({ stops, active, onPick }: RouteStripProps) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 0, overflowX: "auto", padding: "var(--space-6) 0" }}>
      {stops.map((s, i) => (
        <div key={s.name} style={{ flex: 1, minWidth: 96, display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }} onClick={() => onPick && onPick(i)}>
          <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
            <span style={{ flex: 1, height: 3, background: i === 0 ? "transparent" : LOAD_VARS[Math.min(4, Math.floor(stops[i - 1].load * 5))] }} />
            <span style={{ width: i === active ? 18 : 12, height: i === active ? 18 : 12, borderRadius: "var(--radius-pill)", background: LOAD_VARS[Math.min(4, Math.floor(s.load * 5))], boxShadow: i === active ? "0 0 0 4px var(--accent-quiet)" : "none", transition: "var(--transition-ui)" }} />
            <span style={{ flex: 1, height: 3, background: i === stops.length - 1 ? "transparent" : LOAD_VARS[Math.min(4, Math.floor(s.load * 5))] }} />
          </div>
          <span style={{ marginTop: 10, font: "var(--type-caption)", color: i === active ? "var(--text-primary)" : "var(--text-muted)", textAlign: "center", maxWidth: 96 }}>{s.name}</span>
          <span style={{ marginTop: 4, font: "var(--type-mono-s)", color: "var(--text-muted)" }}>{Math.round(s.load * 100)}%</span>
        </div>
      ))}
    </div>
  );
}
