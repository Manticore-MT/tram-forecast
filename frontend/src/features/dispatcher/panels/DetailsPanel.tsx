import { Card, Stat } from "../../../components";
import { routeStops } from "../../../network/tramNetwork";
import { Sparkline } from "../../../shared/charts";
import { ErrorNotice, LoadingNotice } from "../../../shared/notices";
import { useDispatcher, type Place } from "../store";
import { useCurrentSeries, useFocusIndex } from "../forecast";
import { SCALE_UNITS, pointLabel } from "../time";
import { deviationPct, fmtInt, fmtPct, fmtSigned, toneForPct } from "../format";
import { FactorsCard } from "../shared";

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
  const unit = SCALE_UNITS[scale];
  const recommendation = series.stop?.recommendation;
  const factors = (series.stop?.factors ?? []).map((f) => ({ label: FACTOR_LABELS[f] ?? f }));

  return (
    <Card tone="glass" padding="var(--space-6)" className="flex flex-col gap-5">
      <div className="mt-eyebrow">Детали{point ? ` · ${pointLabel(scale, point.periodStart)}` : ""}</div>
      <div className="text-h4">{placeTitle(place)}</div>
      {series.error ? <ErrorNotice error={series.error} /> : series.isLoading || !point ? <LoadingNotice /> : (
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
          {recommendation?.action && recommendation.action !== "NONE" && (
            <Stat
              label="Рекомендация"
              value={`${recommendation.action === "ADD_VEHICLE" ? "+" : "−"}${recommendation.vehicles ?? 1} трамвай`}
            />
          )}
          {series.points.length > 1 && (
            <div>
              <div className="mt-eyebrow mb-2">Динамика</div>
              <Sparkline data={series.points.map((p) => p.forecast)} color="var(--brand-accent)" />
            </div>
          )}
          {factors.length > 0 && <FactorsCard factors={factors} />}
        </>
      )}
    </Card>
  );
}
