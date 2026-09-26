// Colors the map by the real forecast at the focused point in time, so it agrees with the panels.
import React from "react";
import { LOAD_HEX, loadStep } from "../../../shared/load";
import { useRoutes } from "../../../api/hooks";
import { useCurrentSeries, useForecastParams, useFocusIndex } from "../forecast";
import { useDispatcher } from "../store";

export interface MapColors {
  /** Network level: color per routeId. */
  routeColors?: Record<string, string>;
  /** Network level: raw forecast per routeId, for tooltips. */
  routeValues?: Record<string, number>;
  /** Route/stop level: color per stop index. */
  stopColors?: string[];
  /** Route/stop level: raw forecast per stop index, for tooltips. */
  stopValues?: number[];
}

/** Colors for the dispatcher map: routes at network level, stops (and the segment after each)
 *  at route/stop level. Normalized by the window's peak, not by vehicle capacity — there's no
 *  capacity data yet, so load here is relative, not absolute. */
export function useMapColors(): MapColors {
  const place = useDispatcher((s) => s.place);
  const params = useForecastParams();
  const network = useRoutes(place.level === "network" ? params : undefined);
  const series = useCurrentSeries();
  const focus = useFocusIndex(series.points);

  const networkColors = React.useMemo(() => {
    if (place.level !== "network" || focus < 0) return {};
    const routes = network.data?.routes ?? [];
    let max = 0;
    for (const r of routes) for (const p of r.points ?? []) max = Math.max(max, p.forecast ?? 0);
    if (max <= 0) return {};
    const routeColors: Record<string, string> = {};
    const routeValues: Record<string, number> = {};
    for (const r of routes) {
      if (!r.routeId) continue;
      const value = r.points?.[focus]?.forecast ?? 0;
      routeColors[r.routeId] = LOAD_HEX[loadStep(value / max)];
      routeValues[r.routeId] = value;
    }
    return { routeColors, routeValues };
  }, [place.level, network.data, focus]);

  const stopLevelColors = React.useMemo(() => {
    if (place.level === "network" || focus < 0) return {};
    const stops = series.route?.stops ?? [];
    let max = 0;
    for (const s of stops) for (const p of s.points ?? []) max = Math.max(max, p.forecast ?? 0);
    if (max <= 0) return {};
    const stopColors: string[] = [];
    const stopValues: number[] = [];
    stops.forEach((s, i) => {
      const value = s.points?.[focus]?.forecast ?? 0;
      stopColors[i] = LOAD_HEX[loadStep(value / max)];
      stopValues[i] = value;
    });
    return { stopColors, stopValues };
  }, [place.level, series.route, focus]);

  return {
    routeColors: networkColors.routeColors,
    routeValues: networkColors.routeValues,
    stopColors: stopLevelColors.stopColors,
    stopValues: stopLevelColors.stopValues,
  };
}
