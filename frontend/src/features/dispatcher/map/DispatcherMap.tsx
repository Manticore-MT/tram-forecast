import React from "react";
import { useDispatcher } from "../store";
import { MapCanvas, type MapHandle } from "./MapCanvas";
import { useMapColors } from "./useMapColors";

/** The dispatcher's full-screen map: clicks drill through сеть → маршрут,
 *  a click on empty map goes one level up. Stops show only their name, no forecast data. */
export const DispatcherMap = React.forwardRef<MapHandle>(function DispatcherMap(_props, handle) {
  const place = useDispatcher((s) => s.place);
  const { routeColors, routeValues } = useMapColors();

  // Stable handlers read the store at click time, so Leaflet layers aren't rebuilt on every render.
  const onRouteClick = React.useCallback((routeId: string) => {
    useDispatcher.getState().goTo({ level: "route", routeId });
  }, []);
  const onBackgroundClick = React.useCallback(() => useDispatcher.getState().placeUp(), []);

  return (
    <MapCanvas
      ref={handle}
      place={place}
      caption="Остановки и их порядок — реальные (data.mos.ru). Линия между ними — прямая, не путь по рельсам."
      routeColors={routeColors}
      routeValues={routeValues}
      onRouteClick={onRouteClick}
      onBackgroundClick={onBackgroundClick}
      className="absolute inset-0"
    />
  );
});
