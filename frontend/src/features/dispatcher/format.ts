export function fmtInt(n: number): string {
  return Math.round(n).toLocaleString("ru-RU");
}

export function fmtSigned(n: number): string {
  return `${n > 0 ? "+" : n < 0 ? "−" : ""}${fmtInt(Math.abs(n))}`;
}

// Deviation is colored by severity (magnitude), not direction — a route stalled at -100% is just
// as critical as one overloaded at +100%. The arrow carries the sign explicitly so it doesn't
// depend on noticing a "+"/"−" glyph inside a color that's telling a different story.
export function fmtPct(n: number): string {
  const arrow = n > 0 ? "▲ " : n < 0 ? "▼ " : "";
  return `${arrow}${Math.abs(n).toFixed(1)} %`;
}

/** Relative deviation in %, 0 when there's no baseline to compare with. */
export function deviationPct(value: number, baseline: number): number {
  return baseline ? ((value - baseline) / baseline) * 100 : 0;
}

export function toneForPct(pct: number): "danger" | "warn" | "ok" {
  const a = Math.abs(pct);
  return a > 30 ? "danger" : a > 15 ? "warn" : "ok";
}

export const TONE_TEXT: Record<"danger" | "warn" | "ok", string> = {
  danger: "text-status-danger",
  warn: "text-status-warn",
  ok: "text-status-ok",
};

export const TONE_BG: Record<"danger" | "warn" | "ok", string> = {
  danger: "bg-status-danger",
  warn: "bg-status-warn",
  ok: "bg-status-ok",
};
