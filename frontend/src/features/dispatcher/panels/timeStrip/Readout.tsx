import { useDispatcher } from "../../store";
import { useFocusIndex, type SeriesPoint } from "../../forecast";
import { SCALE_UNITS, pointLabel } from "../../time";
import { deviationPct, fmtInt, fmtPct } from "../../format";

/** «18:00 · 1 240 пасс/ч · +12.0 % к базе» for the focused point. */
export function Readout({ points }: { points: SeriesPoint[] }) {
  const scale = useDispatcher((s) => s.scale);
  const point = points[useFocusIndex(points)];
  if (!point) return <span />;

  const pct = fmtPct(deviationPct(point.forecast, point.baseline));
  return (
    <span className="min-w-0 truncate text-ui-s text-text-secondary">
      {pointLabel(scale, point.periodStart)}
      {" · "}
      <span className="text-text-primary">
        {fmtInt(point.forecast)} {SCALE_UNITS[scale]}
      </span>
      {point.baseline > 0 && ` · ${pct} к базе`}
    </span>
  );
}
