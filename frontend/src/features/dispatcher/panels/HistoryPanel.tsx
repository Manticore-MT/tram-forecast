import { useQuery } from "@tanstack/react-query";
import { getHistoryComparison, type HistoryHour } from "../../../api/client";
import { fmtInt } from "../format";
import { ErrorNotice, LoadingNotice } from "../../../shared/notices";
import { LineChart, LineLegend, type LineSeries } from "../overview/LineChart";
import { WeekHeatmap } from "../overview/WeekHeatmap";

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const HOURS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}:00`);

function total(points: HistoryHour[]) {
  return points.some((p) => p.value == null) ? "Нет данных" : fmtInt(points.reduce((s, p) => s + (p.value ?? 0), 0));
}

/** Observed days and a representative week, never forecasts disguised as observations. */
export function HistoryPanel({ date, routeId }: { date: string; routeId: string }) {
  const q = useQuery({
    queryKey: ["history-comparison", date, routeId],
    queryFn: () => getHistoryComparison(date, routeId),
    staleTime: 300_000,
  });
  if (q.isPending) return <LoadingNotice />;
  if (q.isError) return <ErrorNotice error={q.error} onRetry={() => void q.refetch()} />;

  const data = q.data;
  const dow = (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;
  const typical = data.typicalWeek.days[dow];

  const hourly: LineSeries[] = [
    { label: `−7 дней · ${data.lastWeek.date}`, values: data.lastWeek.points.map((p) => p.value), color: "var(--cyan-500)" },
    { label: `−1 месяц · ${data.lastMonth.date}`, values: data.lastMonth.points.map((p) => p.value), color: "var(--brand-accent)", dashed: true },
    { label: `Типичный ${DAYS[dow]}`, values: typical.points.map((p) => p.value), color: "var(--text-muted)", quiet: true },
  ];

  // WeekHeatmap treats a missing cell as "нет данных"; only feed it the hours we actually observed.
  const weekCells = data.typicalWeek.days.flatMap((d) =>
    d.points
      .filter((p): p is HistoryHour & { value: number } => p.value != null)
      .map((p) => ({ dayOfWeek: d.weekday + 1, hour: p.hour, value: p.value })),
  );

  return (
    <section className="flex flex-col gap-4 border-t border-border-subtle pt-4">
      <div className="mt-eyebrow">История для дня {date}</div>
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-caption text-text-muted">
        <span>Неделю назад · {data.lastWeek.date}: {total(data.lastWeek.points)} посадок</span>
        <span>Месяц назад · {data.lastMonth.date}: {total(data.lastMonth.points)} посадок</span>
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
      <div className="flex flex-col gap-2">
        <div className="mt-eyebrow">
          Типичная неделя · {data.typicalWeek.start} — {data.typicalWeek.end}
        </div>
        <WeekHeatmap cells={weekCells} />
      </div>
      <p className="text-caption text-text-muted">
        {data.note} Прочерк — нет данных, не ноль. Это сравнение выбранного дня, не всего горизонта.
      </p>
    </section>
  );
}
