import { useQuery } from "@tanstack/react-query";
import {
  getAttention,
  getLoadMatrix,
  getMeta,
  getModelStats,
  getRouteForecast,
  getRoutes,
  getStopForecast,
} from "./client";

export type Horizon = "day" | "month" | "year";

export interface Corrections {
  weather?: number;
  event?: number;
  season?: number;
}

export interface CommonParams {
  horizon: Horizon;
  date: string;
  snapshot?: "latest" | "initial";
  corrections?: Corrections;
}

function withCorrections(params: CommonParams) {
  return {
    horizon: params.horizon,
    date: params.date,
    snapshot: params.snapshot,
    weather: params.corrections?.weather,
    event: params.corrections?.event,
    season: params.corrections?.season,
  };
}

export function useMeta() {
  return useQuery({
    queryKey: ["meta"],
    queryFn: getMeta,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

export function useRoutes(params: CommonParams) {
  return useQuery({
    queryKey: ["routes", params],
    queryFn: () => getRoutes(withCorrections(params)),
    enabled: !!params.date,
    refetchInterval: params.horizon === "day" ? 30_000 : false,
  });
}

export function useRouteForecast(routeId: string | undefined, params: CommonParams) {
  return useQuery({
    queryKey: ["routeForecast", routeId, params],
    queryFn: () => getRouteForecast(routeId!, withCorrections(params)),
    enabled: !!routeId && !!params.date,
    refetchInterval: params.horizon === "day" ? 30_000 : false,
  });
}

export function useStopForecast(routeId: string | undefined, stopId: string | undefined, params: CommonParams) {
  return useQuery({
    queryKey: ["stopForecast", routeId, stopId, params],
    queryFn: () => getStopForecast(routeId!, stopId!, withCorrections(params)),
    enabled: !!routeId && !!stopId && !!params.date,
    refetchInterval: params.horizon === "day" ? 30_000 : false,
  });
}

export function useAttention(params: CommonParams) {
  return useQuery({
    queryKey: ["attention", params],
    queryFn: () => getAttention(withCorrections(params)),
    enabled: !!params.date,
    refetchInterval: params.horizon === "day" ? 30_000 : false,
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
