import { Card, Stat } from "../../../components";
import { routeStops } from "../../../network/tramNetwork";
import { Sparkline } from "../../../shared/charts";
import { ErrorNotice, LoadingNotice } from "../../../shared/notices";
import { useDispatcher, type Place } from "../store";
import { useCurrentSeries, useFocusIndex } from "../forecast";
import { SCALE_UNITS, pointLabel } from "../time";
import { deviationPct, fmtInt, fmtPct, fmtSigned, toneForPct } from "../format";
import { FactorsCard } from "../shared";
import { useInterval } from "./timeStrip/interval";
import { formatRecommendation } from "../recommendation";

const FACTOR_LABELS: Record<string, string> = {
  weekend: "Выходной день",
  rain: "Осадки",
  holiday: "Праздничный день",
  event: "Событие в городе",
};

function placeTitle(place: Place): string {
  if (place.level === "network") return "Вся сеть";
  if (place.level === "route") return `Маршрут № ${place.routeId}`;
  return routeStops(place.routeId)[place.stopIndex]?.name ?? `Остановка · маршрут № ${place.routeId}`;
}

/** The picked object at the focused point of the time window. */
export function DetailsPanel() {
  const place = useDispatcher((s) => s.place);
  const scale = useDispatcher((s) => s.scale);
  const series = useCurrentSeries();
  const focus = useFocusIndex(series.points);
  const point = series.points[focus];
  const interval = useInterval(series.points);
  const unit = SCALE_UNITS[scale];
  const recommendation = formatRecommendation(series.stop?.recommendation);
  const factors = (series.stop?.factors ?? []).map((f) => ({ label: FACTOR_LABELS[f] ?? f }));
  const peak = series.points.reduce<(typeof series.points)[number] | undefined>(
    (best, p) => (!best || p.forecast > best.forecast ? p : best),
    undefined,
  );
  const updated = series.lastUpdated
    ? new Date(series.lastUpdated).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
    : undefined;

  return (
    <Card tone="glass" padding="var(--space-6)" className="flex flex-col gap-5">
      <div className="mt-eyebrow">Детали{point ? ` · ${pointLabel(scale, point.periodStart)}` : ""}</div>
      <div className="text-h4">{placeTitle(place)}</div>
      {series.error ? <ErrorNotice error={series.error} onRetry={series.refetch} /> : series.isLoading || !point ? <LoadingNotice /> : (
        <>
          <div className="flex gap-6">
            <Stat label="Базовый уровень" value={fmtInt(point.baseline)} unit={unit} />
            <Stat label="Прогноз" value={fmtInt(point.forecast)} unit={unit} />
          </div>
          <Stat
            label="Отклонение"
            value={fmtPct(deviationPct(point.forecast, point.baseline))}
            caption={`${fmtSigned(point.forecast - point.baseline)} ${unit} к базе`}
            tone={toneForPct(deviationPct(point.forecast, point.baseline))}
          />
          {peak && (
            <Stat label="Пик" value={pointLabel(scale, peak.periodStart)} caption={`${fmtInt(peak.forecast)} ${unit}`} />
          )}
          {recommendation && <Stat label="Рекомендация" value={recommendation.label} />}
          {interval && (
            <div className="flex flex-col gap-4 border-t border-border-subtle pt-4">
              <div className="mt-eyebrow">За интервал {interval.label}</div>
              <div className="flex gap-6">
                <Stat label="Всего" value={fmtInt(interval.total)} unit="пасс" />
                <Stat label="В среднем" value={fmtInt(interval.average)} unit={unit} />
              </div>
              <Stat
                label="Отклонение"
                value={fmtPct(deviationPct(interval.total, interval.baseline))}
                caption={`${fmtSigned(interval.total - interval.baseline)} пасс к базе`}
                tone={toneForPct(deviationPct(interval.total, interval.baseline))}
              />
            </div>
          )}
          {series.points.length > 1 && (
            <div>
              <div className="mt-eyebrow mb-2">Динамика</div>
              <Sparkline data={series.points.map((p) => p.forecast)} color="var(--brand-accent)" />
            </div>
          )}
          {factors.length > 0 && <FactorsCard factors={factors} />}
          {updated && <div className="text-caption text-text-muted">Обновлено в {updated}</div>}
        </>
      )}
    </Card>
  );
}
