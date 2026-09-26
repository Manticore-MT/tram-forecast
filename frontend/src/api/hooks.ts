import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getAttention,
  getLoadMatrix,
  getMeta,
  getModelStats,
  getRouteForecast,
  getRoutes,
  getStopForecast,
} from "./client";

export type Horizon = "day" | "week" | "month" | "year";

/** Correction multipliers, each 0.1–3.0; 1 means "no correction". */
export interface Corrections {
  weather: number;
  event: number;
  season: number;
}

export const DEFAULT_CORRECTIONS: Corrections = { weather: 1, event: 1, season: 1 };

export function isDefaultCorrections(c: Corrections): boolean {
  return c.weather === 1 && c.event === 1 && c.season === 1;
}

export interface CommonParams {
  horizon: Horizon;
  date: string;
  /** Omitted when all are 1, so the default scenario and the uncorrected forecast share one cache entry. */
  corrections?: Corrections;
}

export function forecastParams(horizon: Horizon, date: string, corrections: Corrections): CommonParams {
  return isDefaultCorrections(corrections) ? { horizon, date } : { horizon, date, corrections };
}

function toQuery(params: CommonParams) {
  return { horizon: params.horizon, date: params.date, ...params.corrections };
}

/** Only the day view changes while you look at it; month/year/week refetch on remount. */
function refetchInterval(params: CommonParams | undefined) {
  return params?.horizon === "day" ? 30_000 : false;
}

export function useMeta() {
  return useQuery({
    queryKey: ["meta"],
    queryFn: getMeta,
    // `now` drives the «сейчас» marker and the default focus, so it must keep moving.
    refetchInterval: 60_000,
  });
}

export function useRoutes(params: CommonParams | undefined) {
  return useQuery({
    queryKey: ["routes", params],
    queryFn: () => getRoutes(toQuery(params!)),
    enabled: !!params,
    refetchInterval: refetchInterval(params),
    placeholderData: keepPreviousData,
  });
}

export function useRouteForecast(routeId: string | undefined, params: CommonParams | undefined) {
  return useQuery({
    queryKey: ["routeForecast", routeId, params],
    queryFn: () => getRouteForecast(routeId!, toQuery(params!)),
    enabled: !!routeId && !!params,
    refetchInterval: refetchInterval(params),
    placeholderData: keepPreviousData,
  });
}

export function useStopForecast(routeId: string | undefined, stopId: string | undefined, params: CommonParams | undefined) {
  return useQuery({
    queryKey: ["stopForecast", routeId, stopId, params],
    queryFn: () => getStopForecast(routeId!, stopId!, toQuery(params!)),
    enabled: !!routeId && !!stopId && !!params,
    refetchInterval: refetchInterval(params),
    placeholderData: keepPreviousData,
  });
}

export function useAttention(params: CommonParams | undefined) {
  return useQuery({
    queryKey: ["attention", params],
    queryFn: () => getAttention(toQuery(params!)),
    enabled: !!params,
    refetchInterval: refetchInterval(params),
    placeholderData: keepPreviousData,
  });
}

export function useLoadMatrix(routeId: string | undefined) {
  return useQuery({
    queryKey: ["loadMatrix", routeId],
    queryFn: () => getLoadMatrix(routeId!),
    enabled: !!routeId,
  });
}

export function useModelStats(days?: number) {
  return useQuery({
    queryKey: ["modelStats", days],
    queryFn: () => getModelStats({ days }),
    staleTime: 5 * 60_000,
  });
}
