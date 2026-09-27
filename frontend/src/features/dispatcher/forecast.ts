// Hooks joining the UI store (what is picked) with React Query (what the backend says).
// Panels read their data through these, so none of them re-derives params or focus on its own.
import React from "react";
import { useShallow } from "zustand/react/shallow";
import type { components } from "../../api/schema.d.ts";
import {
  DEFAULT_CORRECTIONS,
  forecastParams,
  isDefaultCorrections,
  useMeta,
  useRouteForecast,
  useRoutes,
  type CommonParams,
} from "../../api/hooks";
import { useDispatcher, type Place } from "./store";
import { resolveFocus } from "./time";

type RouteForecast = components["schemas"]["RouteForecast"];

export interface SeriesPoint {
  /** ISO timestamp with the Moscow offset. */
  periodStart: string;
  forecast: number;
  baseline: number;
  /** Present only for past periods of a route. */
  actual?: number;
}

export interface PlaceSeries {
  /** One point per period of the window: 24 hours, 7 or ~30 days, or 12 months. */
  points: SeriesPoint[];
  /** No data to show yet (first load). */
  isLoading: boolean;
  /** A request is in flight, possibly while older points are still shown. */
  isFetching: boolean;
  error: unknown;
  refetch: () => void;
  /** When the backend last recomputed this forecast (ISO). */
  lastUpdated?: string;
  /** Route level: the raw route answer (factors, recommendation, peakAt, lastYear). */
  route?: RouteForecast;
}

/** Seeds the store's clock from /api/meta. Call once at the top of the screen. */
export function useInitClock(): boolean {
  const meta = useMeta();
  const init = useDispatcher((s) => s.init);
  const ready = useDispatcher((s) => s.cursor !== null);
  const today = meta.data?.today;
  const latestDate = meta.data?.latestDate;
  const forecastFrom = meta.data?.forecastFrom ?? null;
  React.useEffect(() => {
    if (today && latestDate) init(today, latestDate, forecastFrom);
  }, [today, latestDate, forecastFrom, init]);
  return ready;
}

/** Request params for the current window. `uncorrected` drops the scenario — the "было" side. */
export function useForecastParams({ uncorrected = false } = {}): CommonParams | undefined {
  const { scale, cursor, corrections } = useDispatcher(
    useShallow((s) => ({ scale: s.scale, cursor: s.cursor, corrections: s.corrections })),
  );
  if (!cursor) return undefined;
  return forecastParams(scale, cursor, uncorrected ? DEFAULT_CORRECTIONS : corrections);
}

export function usePlaceSeries(place: Place, params: CommonParams | undefined): PlaceSeries {
  const routeId = place.level === "network" ? undefined : place.routeId;
  const network = useRoutes(place.level === "network" ? params : undefined);
  const route = useRouteForecast(routeId, params);

  const points = React.useMemo<SeriesPoint[]>(() => {
    if (place.level === "network") {
      const routes = network.data?.routes ?? [];
      const first = routes[0]?.points ?? [];
      return first.map((p, i) => {
        // The network total is only a real fact once every route has one for this period —
        // otherwise it would silently understate the network, not report "no fact yet".
        const actuals = routes.map((r) => r.points?.[i]?.actual);
        const actual = actuals.every((a) => a != null) ? actuals.reduce((sum, a) => sum + a!, 0) : undefined;
        return {
          periodStart: p.periodStart ?? "",
          forecast: routes.reduce((sum, r) => sum + (r.points?.[i]?.forecast ?? 0), 0),
          baseline: routes.reduce((sum, r) => sum + (r.points?.[i]?.baseline ?? 0), 0),
          actual,
        };
      });
    }
    return (route.data?.points ?? []).map((p) => ({
      periodStart: p.periodStart ?? "",
      forecast: p.forecast ?? 0,
      baseline: p.baseline ?? 0,
      actual: p.actual,
    }));
  }, [place.level, network.data, route.data]);

  const main = place.level === "network" ? network : route;
  return {
    points,
    isLoading: main.data === undefined && !main.error,
    isFetching: main.isFetching,
    error: main.error,
    lastUpdated: main.data?.lastUpdated,
    refetch: () => void main.refetch(),
    route: place.level === "network" ? undefined : route.data,
  };
}

/** The forecast for what's picked, with the scenario applied. */
export function useCurrentSeries(): PlaceSeries {
  const place = useDispatcher((s) => s.place);
  return usePlaceSeries(place, useForecastParams());
}

/** Same window without the scenario. Shares the cache with useCurrentSeries while no correction is set. */
export function useUncorrectedSeries(): PlaceSeries {
  const place = useDispatcher((s) => s.place);
  return usePlaceSeries(place, useForecastParams({ uncorrected: true }));
}

export function useScenarioActive(): boolean {
  return useDispatcher((s) => !isDefaultCorrections(s.corrections));
}

/** Index of the focused point in `points` (-1 when there are none). */
export function useFocusIndex(points: SeriesPoint[]): number {
  const focus = useDispatcher((s) => s.focus);
  const now = useMeta().data?.now;
  return resolveFocus(focus, points.map((p) => p.periodStart), now);
}
