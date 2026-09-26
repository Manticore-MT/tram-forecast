import type { components } from "../../../api/schema.d.ts";
import { LOAD_VARS, loadStep } from "../../../shared/load";
import { fmtInt } from "../format";

type MatrixCell = components["schemas"]["MatrixCell"];

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const HOURS = Array.from({ length: 24 }, (_, h) => h);
const HOUR_TICKS = [0, 6, 12, 18];

/** Typical week of a route: weekday × hour, colored relative to the busiest hour of the week. */
export function WeekHeatmap({ cells }: { cells: MatrixCell[] }) {
  const value = new Map(cells.map((c) => [`${c.dayOfWeek}:${c.hour}`, c.value ?? 0]));
  const max = Math.max(1, ...cells.map((c) => c.value ?? 0));
  const busyHours = cells.filter((c) => (c.value ?? 0) / max > 0.8).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-0.75" style={{ gridTemplateColumns: "1.75rem repeat(24, minmax(0, 1fr))" }}>
        {DAYS.map((day, d) => (
          <div key={day} className="contents">
            <span className="text-mono-s leading-4.5 text-text-muted">{day}</span>
            {HOURS.map((h) => {
              // dayOfWeek is ISO: 1 = Monday.
              const v = value.get(`${d + 1}:${h}`);
              const ratio = v === undefined ? 0 : v / max;
              return (
                <span
                  key={h}
                  title={`${day}, ${String(h).padStart(2, "0")}:00 · ${v === undefined ? "нет данных" : fmtInt(v)}`}
                  className="h-4.5 rounded-xs"
                  style={v === undefined
                    ? { background: "var(--bg-surface-2)" }
                    : { background: LOAD_VARS[loadStep(ratio)], opacity: 0.35 + ratio * 0.65 }}
                />
              );
            })}
          </div>
        ))}
        <span />
        {HOURS.map((h) => (
          <span key={h} className="text-mono-s text-text-muted">{HOUR_TICKS.includes(h) ? String(h).padStart(2, "0") : ""}</span>
        ))}
      </div>
      <span className="text-caption text-text-muted">
        Часов с загрузкой выше 80 % от пиковой: {busyHours} из {cells.length}
      </span>
    </div>
  );
}
