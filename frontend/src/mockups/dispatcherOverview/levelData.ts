// Transforms real API responses (schema.d.ts) into the mockup's display shapes
// (DeviationItem / DetailData). These are pure functions — the hooks that fetch the
// underlying data (useRoutes/useRouteForecast/useStopForecast/useAttention) are called
// from the screen components, not here, since React Query hooks must run inside components.
import type { components } from "../../api/schema.d.ts";
import type { DeviationItem, DetailData, DrillTarget, FactorItem } from "./data";

type AttentionZone = components["schemas"]["AttentionZone"];
type NetworkOverview = components["schemas"]["NetworkOverview"];
type RouteForecast = components["schemas"]["RouteForecast"];
type StopForecast = components["schemas"]["StopForecast"];

function toneForLevel(level?: string): "danger" | "warn" | "ok" {
  return level === "CRITICAL" ? "danger" : level === "WARNING" ? "warn" : "ok";
}

function toneForPct(pct: number): "danger" | "warn" | "ok" {
  return Math.abs(pct) > 30 ? "danger" : Math.abs(pct) > 15 ? "warn" : "ok";
}

function fmtTime(iso?: string): string {
  return iso ? new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) : "—";
}

function fmtSigned(n: number | undefined, unit: string): string {
  const v = n ?? 0;
  return `${v > 0 ? "+" : ""}${Math.round(v).toLocaleString("ru-RU")} ${unit}`;
}

function fmtPct(n: number | undefined): string {
  const v = n ?? 0;
  return `${v > 0 ? "+" : ""}${v.toFixed(1)} %`;
}

/** "Зоны внимания" at network level — from GET /api/attention. stopId is opaque, so a zone
 *  can only be drilled to its route (не в конкретную остановку без дополнительного запроса). */
export function zonesFromAttention(zones: AttentionZone[], limit = 5): DeviationItem[] {
  return zones.slice(0, limit).map((z, i) => ({
    title: `Маршрут № ${z.routeId ?? "?"}`,
    absDeviation: fmtSigned(z.deviationAbs, "чел/ч"),
    relDeviation: fmtPct(z.deviationPct),
    peakTime: fmtTime(z.peakAt),
    tone: toneForLevel(z.level),
    selected: i === 0,
    drillTo: { level: "line", route: z.routeId } as DrillTarget,
  }));
}

/** "Зоны внимания" at route level — worst-deviation stops within one route's own forecast
 *  (its `stops` array), positionally matched to the local map geometry (see MapScreens.tsx). */
export function zonesFromRouteStops(rf: RouteForecast | undefined, limit = 2): DeviationItem[] {
  const stops = rf?.stops ?? [];
  const withDev = stops.map((s, i) => {
    const last = s.points?.[s.points.length - 1];
    const pct = last?.baseline ? ((last.forecast! - last.baseline) / last.baseline) * 100 : 0;
    return { i, pct, abs: (last?.forecast ?? 0) - (last?.baseline ?? 0) };
  });
  return withDev
    .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))
    .slice(0, limit)
    .map(({ i, pct, abs }, rank) => ({
      title: `Остановка № ${i + 1}`,
      absDeviation: fmtSigned(abs, "чел/ч"),
      relDeviation: fmtPct(pct),
      peakTime: "—",
      tone: toneForPct(pct),
      selected: rank === 0,
      drillTo: { level: "stop", route: rf?.routeId, stopIndex: i } as DrillTarget,
    }));
}

function seriesForecast(points: { forecast?: number }[] | undefined): number[] {
  return (points ?? []).map((p) => p.forecast ?? 0);
}

export function detailFromNetwork(overview: NetworkOverview | undefined): { detail: DetailData; dynamics: number[] } {
  const routes = overview?.routes ?? [];
  const periodCount = routes[0]?.points?.length ?? 0;
  const sumPerPeriod = Array.from({ length: periodCount }, (_, i) =>
    routes.reduce((sum, r) => sum + (r.points?.[i]?.forecast ?? 0), 0),
  );
  const baselineSum = routes.reduce((sum, r) => sum + (r.points?.[r.points!.length - 1]?.baseline ?? 0), 0);
  const forecastSum = sumPerPeriod[sumPerPeriod.length - 1] ?? 0;
  const deviationAbs = forecastSum - baselineSum;
  const pct = baselineSum ? (deviationAbs / baselineSum) * 100 : 0;
  return {
    detail: {
      title: "Сеть · " + (overview?.date ?? "сегодня"),
      baselineLabel: "Базовый уровень",
      baselineValue: Math.round(baselineSum).toLocaleString("ru-RU"),
      forecastLabel: "Прогноз",
      forecastValue: Math.round(forecastSum).toLocaleString("ru-RU"),
      deviationValue: `${fmtSigned(deviationAbs, "чел/ч")} · ${fmtPct(pct)}`,
      unit: "чел/ч",
      factors: [],
    },
    dynamics: sumPerPeriod,
  };
}

export function detailFromRoute(rf: RouteForecast | undefined): { detail: DetailData; dynamics: number[] } {
  const points = rf?.points ?? [];
  const last = points[points.length - 1];
  const baseline = last?.baseline ?? 0;
  const forecast = last?.forecast ?? 0;
  const deviationAbs = forecast - baseline;
  const pct = baseline ? (deviationAbs / baseline) * 100 : 0;
  return {
    detail: {
      title: `Маршрут № ${rf?.routeId ?? "—"}`,
      baselineLabel: "Базовый уровень",
      baselineValue: Math.round(baseline).toLocaleString("ru-RU"),
      forecastLabel: "Прогноз",
      forecastValue: Math.round(forecast).toLocaleString("ru-RU"),
      deviationValue: `${fmtSigned(deviationAbs, "чел/ч")} · ${fmtPct(pct)}`,
      unit: "чел/ч",
      factors: [],
    },
    dynamics: seriesForecast(points),
  };
}

const FACTOR_LABELS: Record<string, string> = {
  weekend: "Выходной день",
  rain: "Осадки",
  holiday: "Праздничный день",
  event: "Событие в городе",
};

export function detailFromStop(sf: StopForecast | undefined): { detail: DetailData; dynamics: number[] } & { recommendation?: components["schemas"]["Recommendation"] } {
  const points = sf?.points ?? [];
  const last = points[points.length - 1];
  const baseline = last?.baseline ?? 0;
  const forecast = last?.forecast ?? 0;
  const deviationAbs = forecast - baseline;
  const pct = baseline ? (deviationAbs / baseline) * 100 : 0;
  const factors: FactorItem[] = (sf?.factors ?? []).map((f) => ({ label: FACTOR_LABELS[f] ?? f }));
  return {
    detail: {
      title: `Остановка · маршрут № ${sf?.routeId ?? "—"}`,
      baselineLabel: "Базовый уровень",
      baselineValue: Math.round(baseline).toLocaleString("ru-RU"),
      forecastLabel: "Прогноз",
      forecastValue: Math.round(forecast).toLocaleString("ru-RU"),
      deviationValue: `${fmtSigned(deviationAbs, "чел/ч")} · ${fmtPct(pct)}`,
      unit: "чел/ч",
      factors,
    },
    dynamics: seriesForecast(points),
    recommendation: sf?.recommendation,
  };
}
