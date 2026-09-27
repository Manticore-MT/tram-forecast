import { useQuery } from "@tanstack/react-query";
import { getHistoryComparison, type HistoryHour } from "../../../api/client";
import { fmtInt } from "../format";

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
function total(points: HistoryHour[]) {
  return points.some(p => p.value == null) ? "Нет данных" : fmtInt(points.reduce((s, p) => s + (p.value ?? 0), 0));
}

/** Observed days and a representative week, never forecasts disguised as observations. */
export function HistoryPanel({ date, routeId }: { date: string; routeId: string }) {
  const q = useQuery({ queryKey: ["history-comparison", date, routeId],
    queryFn: () => getHistoryComparison(date, routeId), staleTime: 300_000 });
  if (q.isPending) return <p>Загрузка истории…</p>;
  if (q.isError) return <p>История недоступна. <button onClick={() => q.refetch()}>Повторить</button></p>;
  const data = q.data;
  const dow = (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;
  const typical = data.typicalWeek.days[dow];
  return <section className="flex flex-col gap-3 border-t border-border-subtle pt-4">
    <div className="mt-eyebrow">История для дня {date}</div>
    <p>Неделю назад · {data.lastWeek.date}: {total(data.lastWeek.points)} посадок</p>
    <p>Месяц назад · {data.lastMonth.date}: {total(data.lastMonth.points)} посадок</p>
    <details>
      <summary className="cursor-pointer">Почасовое сравнение</summary>
      <table className="w-full text-caption tabular-nums">
        <thead><tr><th>Час</th><th>−7 дней</th><th>−1 месяц</th><th>Типичный {DAYS[dow]}</th></tr></thead>
        <tbody>{data.lastWeek.points.map((p, i) => <tr key={p.hour}>
          <td>{String(p.hour).padStart(2, "0")}:00</td>
          {[p, data.lastMonth.points[i], typical.points[i]].map((v, j) =>
            <td key={j}>{v.value == null ? "—" : fmtInt(v.value)}</td>)}
        </tr>)}</tbody>
      </table>
    </details>
    <div className="mt-eyebrow">Типичная неделя · сумма почасовых медиан</div>
    <p className="text-caption">По истории {data.typicalWeek.start} — {data.typicalWeek.end}</p>
    <table className="w-full text-caption tabular-nums">
      <thead><tr><th>День</th><th>Посадки</th><th>Дней истории</th></tr></thead>
      <tbody>{data.typicalWeek.days.map(d => <tr key={d.weekday}>
        <td>{DAYS[d.weekday]}</td><td>{total(d.points)}</td><td>{d.observations}</td>
      </tr>)}</tbody>
    </table>
    <p className="text-caption text-text-muted">{data.note} Прочерк — нет данных, не ноль. Это сравнение выбранного дня, не всего горизонта.</p>
  </section>;
}
