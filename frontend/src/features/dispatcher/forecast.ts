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
  useStopForecast,
  type CommonParams,
} from "../../api/hooks";
import { useDispatcher, type Place } from "./store";
import { resolveFocus } from "./time";

type RouteForecast = components["schemas"]["RouteForecast"];
type StopForecast = components["schemas"]["StopForecast"];

export interface SeriesPoint {
  /** ISO timestamp with the Moscow offset. */
  periodStart: string;
  forecast: number;
  baseline: number;
  /** Present only for past periods of a route or stop. */
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
  /** Route level and below: the raw route answer (per-stop series, lastYear). */
  route?: RouteForecast;
  /** Stop level: the raw stop answer (factors, recommendation, peakAt). */
  stop?: StopForecast;
}

/** Seeds the store's clock from /api/meta. Call once at the top of the screen. */
export function useInitClock(): boolean {
  const meta = useMeta();
  const init = useDispatcher((s) => s.init);
  const ready = useDispatcher((s) => s.cursor !== null);
  const today = meta.data?.today;
  const latestDate = meta.data?.latestDate;
  React.useEffect(() => {
    if (today && latestDate) init(today, latestDate);
  }, [today, latestDate, init]);
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
  const stopId = place.level === "stop" ? route.data?.stops?.[place.stopIndex]?.stopId : undefined;
  const stop = useStopForecast(place.level === "stop" ? routeId : undefined, stopId, params);

  const points = React.useMemo<SeriesPoint[]>(() => {
    if (place.level === "network") {
      const routes = network.data?.routes ?? [];
      const first = routes[0]?.points ?? [];
      return first.map((p, i) => ({
        periodStart: p.periodStart ?? "",
        forecast: routes.reduce((sum, r) => sum + (r.points?.[i]?.forecast ?? 0), 0),
        baseline: routes.reduce((sum, r) => sum + (r.points?.[i]?.baseline ?? 0), 0),
      }));
    }
    const raw = place.level === "route" ? route.data?.points : stop.data?.points;
    return (raw ?? []).map((p) => ({
      periodStart: p.periodStart ?? "",
      forecast: p.forecast ?? 0,
      baseline: p.baseline ?? 0,
      actual: p.actual,
    }));
  }, [place.level, network.data, route.data, stop.data]);

  const main = place.level === "network" ? network : place.level === "route" ? route : stop;
  // A stop can't even be requested until its route answered, so the route's error is the stop's too.
  const error = main.error ?? (place.level === "stop" ? route.error : null);
  return {
    points,
    isLoading: main.data === undefined && !error,
    isFetching: main.isFetching || (place.level === "stop" && route.isFetching),
    error,
    lastUpdated: main.data?.lastUpdated,
    refetch: () => {
      if (place.level === "stop" && route.error) void route.refetch();
      else void main.refetch();
    },
    route: place.level === "network" ? undefined : route.data,
    stop: place.level === "stop" ? stop.data : undefined,
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
