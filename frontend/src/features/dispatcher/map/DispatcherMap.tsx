import React from "react";
import { useDispatcher } from "../store";
import { MapCanvas, type MapHandle } from "./MapCanvas";
import { useMapColors } from "./useMapColors";

/** The dispatcher's full-screen map: clicks drill through сеть → маршрут → остановка,
 *  a click on empty map goes one level up. */
export const DispatcherMap = React.forwardRef<MapHandle>(function DispatcherMap(_props, handle) {
  const place = useDispatcher((s) => s.place);
  const segment = useDispatcher((s) => s.segment);
  const { routeColors, routeValues, stopColors, stopValues } = useMapColors();

  // Stable handlers read the store at click time, so Leaflet layers aren't rebuilt on every render.
  const onRouteClick = React.useCallback((routeId: string) => {
    useDispatcher.getState().goTo({ level: "route", routeId });
  }, []);
  // Simple 2-click accumulator: click 1 picks the anchor stop, click 2 on a different stop of the
  // same route turns [anchor, click] into a segment, click 3 restarts from scratch at that stop.
  const onStopClick = React.useCallback((stopIndex: number) => {
    const { place, segment, goTo, setSegment } = useDispatcher.getState();
    if (place.level === "network") return;
    if (place.level === "stop" && !segment && place.stopIndex !== stopIndex) {
      setSegment([place.stopIndex, stopIndex]);
      return;
    }
    setSegment(null);
    goTo({ level: "stop", routeId: place.routeId, stopIndex });
  }, []);
  const onBackgroundClick = React.useCallback(() => useDispatcher.getState().placeUp(), []);

  return (
    <MapCanvas
      ref={handle}
      place={place}
      segment={segment}
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
