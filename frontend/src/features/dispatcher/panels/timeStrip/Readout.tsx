import { useDispatcher } from "../../store";
import { useFocusIndex, type SeriesPoint } from "../../forecast";
import { SCALE_UNITS, pointLabel } from "../../time";
import { deviationPct, fmtInt, fmtPct } from "../../format";
import { useInterval } from "./interval";

/** «18:00 · 1 240 пасс/ч · +12.0 % к базе» for the focused point, or the selected interval's totals. */
export function Readout({ points }: { points: SeriesPoint[] }) {
  const scale = useDispatcher((s) => s.scale);
  const point = points[useFocusIndex(points)];
  const interval = useInterval(points);

  if (interval) {
    return (
      <span className="min-w-0 truncate text-ui-s text-text-secondary">
        {interval.label}
        {" · всего "}
        <span className="text-text-primary">{fmtInt(interval.total)} пасс</span>
        {" · в среднем "}
        <span className="text-text-primary">
          {fmtInt(interval.average)} {SCALE_UNITS[scale]}
        </span>
      </span>
    );
  }

  if (!point) return <span />;
  const pct = fmtPct(deviationPct(point.forecast, point.baseline));
  return (
    <span className="min-w-0 truncate text-ui-s text-text-secondary">
      {pointLabel(scale, point.periodStart)}
      {" · "}
      <span className="text-text-primary">
        {fmtInt(point.forecast)} {SCALE_UNITS[scale]}
      </span>
      {point.actual != null && (
        <>
          {" · "}
          <span className="text-text-primary">факт {fmtInt(point.actual)}</span>
        </>
      )}
      {point.baseline > 0 && ` · ${pct} к базе`}
    </span>
  );
}
