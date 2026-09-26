import { useDispatcher } from "../../store";
import type { SeriesPoint } from "../../forecast";
import { rangeLabel } from "../../time";

export interface IntervalSummary {
  range: [number, number];
  label: string;
  /** Sum of the forecast over the interval, passengers. */
  total: number;
  /** Sum of the baseline over the interval. */
  baseline: number;
  /** Mean forecast per point, in the scale's unit. */
  average: number;
}

/** Aggregate of the selected interval of the window; null when none is selected. */
export function useInterval(points: SeriesPoint[]): IntervalSummary | null {
  const scale = useDispatcher((s) => s.scale);
  const range = useDispatcher((s) => s.range);
  if (!range || range[0] < 0 || range[0] === range[1] || range[1] >= points.length) return null;
  const slice = points.slice(range[0], range[1] + 1);
  const total = slice.reduce((sum, p) => sum + p.forecast, 0);
  return {
    range,
    label: rangeLabel(scale, points.map((p) => p.periodStart), range),
    total,
    baseline: slice.reduce((sum, p) => sum + p.baseline, 0),
    average: total / slice.length,
  };
}
