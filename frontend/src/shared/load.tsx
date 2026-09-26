/** The five-step --load-* ramp — the only sanctioned load-color scale (see frontend/CLAUDE.md). */
export const LOAD_VARS = ["var(--load-1)", "var(--load-2)", "var(--load-3)", "var(--load-4)", "var(--load-5)"];
/** Same ramp as hex, for Leaflet which can't resolve CSS variables. */
export const LOAD_HEX = ["#2ED47A", "#A3E635", "#FFB020", "#FB7B3C", "#F0392B"];
export const LOAD_LABELS = ["Свободно", "Комфортно", "Умеренно", "Плотно", "Перегружено"];

/** 0..1 load ratio → ramp step 0..4. */
export function loadStep(ratio: number): number {
  return Math.max(0, Math.min(4, Math.floor(ratio * 5)));
}

export function LoadLegend() {
  return (
    <div className="flex flex-wrap gap-4">
      {LOAD_LABELS.map((label, i) => (
        <span key={label} className="inline-flex items-center gap-1.5 text-caption text-text-muted">
          <span className="size-2.5 rounded-xs" style={{ background: LOAD_VARS[i] }} />
          {label}
        </span>
      ))}
    </div>
  );
}
