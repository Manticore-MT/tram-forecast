export function fmtInt(n: number): string {
  return Math.round(n).toLocaleString("ru-RU");
}

export function fmtSigned(n: number): string {
  return `${n > 0 ? "+" : n < 0 ? "−" : ""}${fmtInt(Math.abs(n))}`;
}

export function fmtPct(n: number): string {
  return `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(1)} %`;
}

/** Relative deviation in %, 0 when there's no baseline to compare with. */
export function deviationPct(value: number, baseline: number): number {
  return baseline ? ((value - baseline) / baseline) * 100 : 0;
}

export function toneForPct(pct: number): "danger" | "warn" | "ok" {
  const a = Math.abs(pct);
  return a > 30 ? "danger" : a > 15 ? "warn" : "ok";
}
