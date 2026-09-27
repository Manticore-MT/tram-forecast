import { useQuery } from "@tanstack/react-query";
import { getHistoryComparison, getRouteForecast, getRoutes, type HistoryHour } from "../../../api/client";
import { fmtInt } from "../format";
import { ErrorNotice, LoadingNotice } from "../../../shared/notices";
import { LineChart, LineLegend, type LineSeries } from "../overview/LineChart";

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const HOURS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}:00`);

function total(points: HistoryHour[]) {
  return points.some((p) => p.value == null) ? "Нет данных" : fmtInt(points.reduce((s, p) => s + (p.value ?? 0), 0));
}

async function priorForecast(date: string, routeId: string): Promise<HistoryHour[]> {
  const params = { horizon: "day" as const, date };
  const routes = routeId === "all"
    ? ((await getRoutes(params)).routes ?? [])
    : [await getRouteForecast(routeId, params)];
  if (routes.length === 0) throw new Error("Нет маршрутного прогноза для сравнения");
  return HOURS.map((_, hour) => ({ hour,
    value: routes.reduce((sum, route) => sum + (route.points?.[hour]?.forecast ?? 0), 0) }));
}

/** Observed days and a representative week, never forecasts disguised as observations. */
export function HistoryPanel({ date, routeId }: { date: string; routeId: string }) {
  const q = useQuery({
    queryKey: ["history-comparison", date, routeId],
    queryFn: () => getHistoryComparison(date, routeId),
    staleTime: 300_000,
  });
  const previousWeek = q.data?.lastWeek;
  const previousMonth = q.data?.lastMonth;
  const weekForecast = useQuery({
    queryKey: ["prior-forecast", routeId, previousWeek?.date],
    queryFn: () => priorForecast(previousWeek!.date, routeId),
    enabled: !!previousWeek && !previousWeek.available && previousWeek.date >= "2025-11-01" && previousWeek.date < date,
    staleTime: 300_000,
  });
  const monthForecast = useQuery({
    queryKey: ["prior-forecast", routeId, previousMonth?.date],
    queryFn: () => priorForecast(previousMonth!.date, routeId),
    enabled: !!previousMonth && !previousMonth.available && previousMonth.date >= "2025-11-01" && previousMonth.date < date,
    staleTime: 300_000,
  });
  if (q.isPending) return <LoadingNotice />;
  if (q.isError) return <ErrorNotice error={q.error} onRetry={() => void q.refetch()} />;

  const data = q.data;
  const dow = (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;
  const typical = data.typicalWeek.days[dow];
  const weekIsForecast = !data.lastWeek.available && !!weekForecast.data;
  const monthIsForecast = !data.lastMonth.available && !!monthForecast.data;
  const weekPoints = weekIsForecast ? weekForecast.data : data.lastWeek.points;
  const monthPoints = monthIsForecast ? monthForecast.data : data.lastMonth.points;
  const weekSource = data.lastWeek.available ? "факт" : weekIsForecast ? "прогноз" : "нет данных";
  const monthSource = data.lastMonth.available ? "факт" : monthIsForecast ? "прогноз" : "нет данных";

  const hourly: LineSeries[] = [
    { label: `−7 дней · ${data.lastWeek.date} (${weekSource})`, values: weekPoints.map((p) => p.value), color: "var(--cyan-500)" },
    { label: `−1 месяц · ${data.lastMonth.date} (${monthSource})`, values: monthPoints.map((p) => p.value), color: "var(--brand-accent)", dashed: true },
    { label: `Типичный ${DAYS[dow]}`, values: typical.points.map((p) => p.value), color: "var(--text-muted)", quiet: true },
  ];

  return (
    <section className="flex flex-col gap-4 border-t border-border-subtle pt-4">
      <div className="mt-eyebrow">История для дня {date}</div>
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-caption text-text-muted">
        <span>Неделю назад · {data.lastWeek.date} ({weekSource}): {total(weekPoints)} посадок</span>
        <span>Месяц назад · {data.lastMonth.date} ({monthSource}): {total(monthPoints)} посадок</span>
      </div>
      <div className="flex flex-col gap-2">
        <LineLegend series={hourly} />
        <LineChart
          ariaLabel="Почасовое сравнение: неделю назад, месяц назад и типичный день недели"
          series={hourly}
          labels={HOURS}
          height={160}
        />
      </div>
      <p className="text-caption text-text-muted">
        Сравнение с прошлым прогнозом не является фактом; для него используются исходные значения без текущих ползунков коррекции.
        {" "}{data.note} Прочерк — нет данных, не ноль. Это сравнение выбранного дня, не всего горизонта.
      </p>
    </section>
  );
}
