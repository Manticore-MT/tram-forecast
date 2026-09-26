import React from "react";
import { useDispatcher } from "../store";
import { MapCanvas, type MapHandle } from "./MapCanvas";
import { useMapColors } from "./useMapColors";

/** The dispatcher's full-screen map: clicks drill through сеть → маршрут → остановка,
 *  a click on empty map goes one level up. */
export const DispatcherMap = React.forwardRef<MapHandle>(function DispatcherMap(_props, handle) {
  const place = useDispatcher((s) => s.place);
  const { routeColors, routeValues, stopColors, stopValues } = useMapColors();

  // Stable handlers read the store at click time, so Leaflet layers aren't rebuilt on every render.
  const onRouteClick = React.useCallback((routeId: string) => {
    useDispatcher.getState().goTo({ level: "route", routeId });
  }, []);
  const onStopClick = React.useCallback((stopIndex: number) => {
    const { place, goTo } = useDispatcher.getState();
    if (place.level !== "network") goTo({ level: "stop", routeId: place.routeId, stopIndex });
  }, []);
  const onBackgroundClick = React.useCallback(() => useDispatcher.getState().placeUp(), []);

  return (
    <MapCanvas
      ref={handle}
      place={place}
      routeColors={routeColors}
      routeValues={routeValues}
      stopColors={stopColors}
      stopValues={stopValues}
      onRouteClick={onRouteClick}
      onStopClick={onStopClick}
      onBackgroundClick={onBackgroundClick}
      className="absolute inset-0"
    />
  );
});
