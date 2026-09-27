import { Card } from "../../../components";
import type { components } from "../../../api/schema.d.ts";
import { useAttention } from "../../../api/hooks";
import { ErrorNotice, LoadingNotice } from "../../../shared/notices";
import { useDispatcher } from "../store";
import { useCurrentSeries, useFocusIndex, useForecastParams, type SeriesPoint } from "../forecast";
import { pointLabel, type Scale } from "../time";
import { deviationPct, fmtPct, fmtSigned, toneForPct } from "../format";
import { DeviationList } from "../shared";
import { formatRecommendation } from "../recommendation";
import type { DeviationItem } from "../types";

type AttentionZone = components["schemas"]["AttentionZone"];

/** Network level: the backend's attention zones for the whole window, worst first. A zone's stopId
 *  doesn't match the map yet, so a zone drills into its route. */
export function zonesFromAttention(zones: AttentionZone[], scale: Scale, limit = 3): DeviationItem[] {
  return zones.slice(0, limit).map((z) => ({
    title: `Маршрут № ${z.routeId ?? "?"}`,
    absDeviation: fmtSigned(z.deviationAbs ?? 0),
    relDeviation: fmtPct(z.deviationPct ?? 0),
    peakTime: z.peakAt ? pointLabel(scale, z.peakAt) : "—",
    tone: z.level === "CRITICAL" ? "danger" : z.level === "WARNING" ? "warn" : "ok",
    drillTo: z.routeId ? { level: "route", routeId: z.routeId } : undefined,
    action: formatRecommendation(z.recommendation),
  }));
}

/** Route level: the time points in the current window deviating most from baseline. Ranks the
 *  route's own aggregate series (real data), not the per-stop split — the API splits a route's
 *  total forecast equally across its stops, so ranking stops by deviation is meaningless (see
 *  docs/frontend-integration.md and docs/open-questions.md). Clicking an item moves the time
 *  focus to that point within the current window, rather than navigating. */
function zonesFromRouteSeries(points: SeriesPoint[], scale: Scale, focus: number, limit = 3): DeviationItem[] {
  return points
    .map((p, i) => ({ i, abs: p.forecast - p.baseline, pct: deviationPct(p.forecast, p.baseline) }))
    .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))
    .slice(0, limit)
    .map(({ i, abs, pct }) => ({
      title: pointLabel(scale, points[i].periodStart),
      absDeviation: fmtSigned(abs),
      relDeviation: fmtPct(pct),
      tone: toneForPct(pct),
      selected: i === focus,
      focusIndex: i,
      periodStart: points[i].periodStart,
    }));
}

export function AttentionPanel() {
  const place = useDispatcher((s) => s.place);
  const scale = useDispatcher((s) => s.scale);
  const goTo = useDispatcher((s) => s.goTo);
  const setFocus = useDispatcher((s) => s.setFocus);
  const attention = useAttention(useForecastParams());
  const series = useCurrentSeries();
  const focus = useFocusIndex(series.points);
  const drillTime = useDispatcher((s) => s.drillTime);

  const network = place.level === "network";
  const error = network ? attention.error : series.error;
  const ready = network ? !!attention.data : !!series.route;
  const items = network
    ? zonesFromAttention(attention.data?.zones ?? [], scale)
    : series.route ? zonesFromRouteSeries(series.points, scale, focus) : [];

  return (
    <Card tone="glass" padding="var(--space-4)">
      {error ? <ErrorNotice error={error} onRetry={network ? () => void attention.refetch() : series.refetch} /> : !ready ? <LoadingNotice /> : (
        <DeviationList
          title="Зоны внимания"
          items={items}
          onSelect={goTo}
          onSelectIndex={network ? undefined : (i) => setFocus(i)}
          onDrillDay={network ? undefined : drillTime}
        />
      )}
    </Card>
  );
}
