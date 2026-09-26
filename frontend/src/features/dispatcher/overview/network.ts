import type { components } from "../../../api/schema.d.ts";
import { useDispatcher } from "../store";
import type { SeriesPoint } from "../forecast";
import { addDays, addMonths, shiftCursor, windowLabel, type Scale } from "../time";

type RouteSeries = components["schemas"]["RouteSeries"];

export type CompareMode = "period" | "year";

/** Overview → dispatcher tab, already drilled into the route. */
export function openRoute(routeId: string) {
  const s = useDispatcher.getState();
  s.goTo({ level: "route", routeId });
  s.setView("dispatcher");
}

/** Sum over routes per period of the window. */
export function networkPoints(routes: RouteSeries[]): SeriesPoint[] {
  const first = routes[0]?.points ?? [];
  return first.map((p, i) => ({
    periodStart: p.periodStart ?? "",
    forecast: routes.reduce((sum, r) => sum + (r.points?.[i]?.forecast ?? 0), 0),
    baseline: routes.reduce((sum, r) => sum + (r.points?.[i]?.baseline ?? 0), 0),
  }));
}

export interface RouteTotal {
  routeId: string;
  forecast: number;
  baseline: number;
}

export function routeTotals(routes: RouteSeries[]): RouteTotal[] {
  return routes
    .filter((r): r is RouteSeries & { routeId: string } => !!r.routeId)
    .map((r) => ({
      routeId: r.routeId,
      forecast: (r.points ?? []).reduce((sum, p) => sum + (p.forecast ?? 0), 0),
      baseline: (r.points ?? []).reduce((sum, p) => sum + (p.baseline ?? 0), 0),
    }));
}

export function sumForecast(points: SeriesPoint[]): number {
  return points.reduce((sum, p) => sum + p.forecast, 0);
}

export function peakIndex(points: SeriesPoint[]): number {
  let best = -1;
  points.forEach((p, i) => {
    if (best === -1 || p.forecast > points[best].forecast) best = i;
  });
  return best;
}

/** On the year scale the previous period already is the previous year. */
export function effectiveMode(scale: Scale, mode: CompareMode): CompareMode {
  return scale === "year" ? "year" : mode;
}

export function comparisonCursor(scale: Scale, cursor: string, mode: CompareMode): string {
  if (effectiveMode(scale, mode) === "year") return addMonths(cursor, -12);
  // A single day is compared with the same weekday a week earlier: weekdays differ too much.
  return scale === "day" ? addDays(cursor, -7) : shiftCursor(scale, cursor, -1);
}

const PERIOD_OPTION: Record<Scale, string> = {
  day: "К тому же дню неделю назад",
  week: "К прошлым 7 дням",
  month: "К прошлому месяцу",
  year: "К прошлому году",
};

export function compareOptions(scale: Scale): { value: CompareMode; label: string }[] {
  if (scale === "year") return [{ value: "year", label: "К прошлому году" }];
  return [
    { value: "period", label: PERIOD_OPTION[scale] },
    { value: "year", label: "К прошлому году" },
  ];
}

export function comparisonLabel(scale: Scale, cursor: string, mode: CompareMode): string {
  return windowLabel(scale, comparisonCursor(scale, cursor, mode));
}

const MOSCOW_TIME = new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Moscow" });

export function updatedAt(iso: string | undefined): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : MOSCOW_TIME.format(t);
}
