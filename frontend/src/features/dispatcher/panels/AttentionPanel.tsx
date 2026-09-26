import { Card } from "../../../components";
import type { components } from "../../../api/schema.d.ts";
import { useAttention } from "../../../api/hooks";
import { routeStops } from "../../../network/tramNetwork";
import { ErrorNotice, LoadingNotice } from "../../../shared/notices";
import { useDispatcher } from "../store";
import { useCurrentSeries, useFocusIndex, useForecastParams } from "../forecast";
import { pointLabel, type Scale } from "../time";
import { deviationPct, fmtPct, fmtSigned, toneForPct } from "../format";
import { DeviationList } from "../shared";
import { formatRecommendation } from "../recommendation";
import type { DeviationItem } from "../types";

type AttentionZone = components["schemas"]["AttentionZone"];
type RouteForecast = components["schemas"]["RouteForecast"];

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

/** Route level: the stops deviating most at the focused point. The API's stops are matched to
 *  the map by position along the route. */
function zonesFromRouteStops(rf: RouteForecast, focus: number, selectedStop: number, limit = 3): DeviationItem[] {
  const routeId = rf.routeId ?? "";
  const names = routeStops(routeId);
  return (rf.stops ?? [])
    .map((s, i) => {
      const p = s.points?.[focus];
      const forecast = p?.forecast ?? 0;
      const baseline = p?.baseline ?? 0;
      return { i, abs: forecast - baseline, pct: deviationPct(forecast, baseline) };
    })
    .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))
    .slice(0, limit)
    .map(({ i, abs, pct }) => ({
      title: names[i]?.name ?? `Остановка № ${i + 1}`,
      absDeviation: fmtSigned(abs),
      relDeviation: fmtPct(pct),
      peakTime: "—",
      tone: toneForPct(pct),
      selected: i === selectedStop,
      drillTo: { level: "stop", routeId, stopIndex: i },
    }));
}

export function AttentionPanel() {
  const place = useDispatcher((s) => s.place);
  const scale = useDispatcher((s) => s.scale);
  const goTo = useDispatcher((s) => s.goTo);
  const attention = useAttention(useForecastParams());
  const series = useCurrentSeries();
  const focus = useFocusIndex(series.points);

  const network = place.level === "network";
  const error = network ? attention.error : series.error;
  const ready = network ? !!attention.data : !!series.route;
  const items = network
    ? zonesFromAttention(attention.data?.zones ?? [], scale)
    : series.route ? zonesFromRouteStops(series.route, focus, place.level === "stop" ? place.stopIndex : -1) : [];

  return (
    <Card tone="glass" padding="var(--space-4)">
      {error ? <ErrorNotice error={error} onRetry={network ? () => void attention.refetch() : series.refetch} /> : !ready ? <LoadingNotice /> : (
        <DeviationList title="Зоны внимания" items={items} onSelect={goTo} />
      )}
    </Card>
  );
}
