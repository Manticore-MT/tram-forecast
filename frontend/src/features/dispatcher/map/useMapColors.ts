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
}

/** Colors for the dispatcher map: routes at network level, by the window's peak — not by vehicle
 *  capacity, there's no capacity data yet, so load here is relative, not absolute. */
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

  // Route level: color the selected route's own line by its load relative to its own window,
  // same basis the time strip bars use — so the map agrees with what's under it.
  const routeLevelColors = React.useMemo(() => {
    if (place.level === "network" || focus < 0) return {};
    const points = series.points;
    if (!points.length) return {};
    const max = Math.max(1, ...points.map((p) => p.actual ?? p.forecast ?? 0));
    const value = points[focus]?.actual ?? points[focus]?.forecast ?? 0;
    return { [place.routeId]: LOAD_HEX[loadStep(value / max)] };
  }, [place, series.points, focus]);

  return {
    routeColors: place.level === "network" ? networkColors.routeColors : routeLevelColors,
    routeValues: networkColors.routeValues,
  };
}
