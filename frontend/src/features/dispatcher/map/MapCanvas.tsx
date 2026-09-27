import React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../../styles/leaflet-dark.css";
import { cn } from "@/lib/utils";
import { Card } from "../../../components";
import { TRAM_ROUTES, routeStops } from "../../../network/tramNetwork";
import type { Place } from "../store";

/** Line/marker color while no forecast color is known. */
export const NEUTRAL_HEX = "#6B7680";
const ACCENT_HEX = "#F0392B";

export interface MapCanvasProps {
  place: Place;
  caption?: string;
  /** Network level: color per routeId. Missing routes are drawn neutral. */
  routeColors?: Record<string, string>;
  /** Network level: raw forecast per routeId, shown in the tooltip when present. */
  routeValues?: Record<string, number>;
  onRouteClick?: (routeId: string) => void;
  /** Click on empty map (not a line or a stop). */
  onBackgroundClick?: () => void;
  className?: string;
}

/** Camera controls for UI outside the map (the zoom pill next to the breadcrumbs). */
export interface MapHandle {
  zoomIn(): void;
  zoomOut(): void;
  /** Back to the whole network, or to the picked route. */
  fit(): void;
}

function fitView(map: L.Map, routeId: string | undefined) {
  const lls = routeId ? routeStops(routeId).map((s) => s.ll) : Object.values(TRAM_ROUTES).flatMap((r) => r.stops.map((s) => s.ll));
  if (lls.length) map.flyToBounds(lls, routeId ? { padding: [48, 48], maxZoom: 15 } : { padding: [24, 24] });
}

/** Leaflet/OSM map of the dataset's tram routes. Knows geometry and clicks, not forecasts:
 *  colors come in as props. */
export const MapCanvas = React.forwardRef<MapHandle, MapCanvasProps>(function MapCanvas(
  { place, caption, routeColors, routeValues, onRouteClick, onBackgroundClick, className },
  handle,
) {
  const ref = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<L.Map | null>(null);
  const layerRef = React.useRef<L.LayerGroup | null>(null);

  React.useEffect(() => {
    if (mapRef.current || !ref.current) return;
    const el = ref.current;
    const map = L.map(el, { zoomControl: false, attributionControl: false }).setView([55.779, 37.699], 13);
    L.control.attribution({ prefix: false }).addTo(map);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors" }).addTo(map);
    mapRef.current = map;
    // The container can still be 0×0 at mount; Leaflet would cache that size and draw nothing.
    const sync = () => map.invalidateSize(false);
    requestAnimationFrame(sync);
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => { ro.disconnect(); map.remove(); mapRef.current = null; };
  }, []);

  const routeId = place.level === "network" ? undefined : place.routeId;

  // Refit only when the viewed route changes, not on every recolor.
  React.useEffect(() => {
    if (mapRef.current) fitView(mapRef.current, routeId);
  }, [routeId]);

  React.useImperativeHandle(handle, () => ({
    zoomIn: () => mapRef.current?.zoomIn(),
    zoomOut: () => mapRef.current?.zoomOut(),
    fit: () => { if (mapRef.current) fitView(mapRef.current, routeId); },
  }), [routeId]);

  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    layerRef.current?.remove();
    const g = L.layerGroup();
    const stopClicks = (e: L.LeafletMouseEvent) => L.DomEvent.stopPropagation(e);

    if (!routeId) {
      for (const r of Object.values(TRAM_ROUTES)) {
        const color = routeColors?.[r.number] ?? NEUTRAL_HEX;
        const value = routeValues?.[r.number];
        const label = value !== undefined ? `Маршрут № ${r.number} · ${Math.round(value)}` : `Маршрут № ${r.number}`;
        L.polyline(r.stops.map((s) => s.ll), { color, weight: 4, opacity: 0.85 })
          .bindTooltip(label, { sticky: true })
          .on("click", (e) => { stopClicks(e); onRouteClick?.(r.number); })
          .addTo(g);
      }
    } else {
      // Background: every other route, dimmed and clickable, same as the network view.
      for (const r of Object.values(TRAM_ROUTES)) {
        if (r.number === routeId) continue;
        L.polyline(r.stops.map((s) => s.ll), { color: NEUTRAL_HEX, weight: 4, opacity: 0.8 })
          .bindTooltip(`Маршрут № ${r.number}`, { sticky: true })
          .on("click", (e) => { stopClicks(e); onRouteClick?.(r.number); })
          .addTo(g);
      }
      const stops = routeStops(routeId);
      const lineColor = routeColors?.[routeId] ?? ACCENT_HEX;
      for (let i = 0; i < stops.length - 1; i++) {
        L.polyline([stops[i].ll, stops[i + 1].ll], { color: lineColor, weight: 6, opacity: 0.85 }).addTo(g);
      }
      stops.forEach((s) => {
        // Stops carry no forecast data (route-level only) — just geometry and a name tooltip.
        L.circleMarker(s.ll, { radius: 7, color: "#0E1113", weight: 2, fillColor: NEUTRAL_HEX, fillOpacity: 1, className: "tram-stop-marker" })
          .bindTooltip(s.name, { direction: "top" })
          .on("click", stopClicks)
          .addTo(g);
      });
    }
    g.addTo(map);
    layerRef.current = g;
  }, [routeId, routeColors, routeValues, onRouteClick]);

  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !onBackgroundClick) return;
    map.on("click", onBackgroundClick);
    return () => { map.off("click", onBackgroundClick); };
  }, [onBackgroundClick]);

  return (
    <div className={cn("relative isolate z-0 overflow-hidden", className)}>
      <div ref={ref} style={{ position: "absolute", inset: 0, background: "var(--ink-800)" }} />
      {caption && (
        <div style={{ position: "absolute", left: 12, bottom: 240, zIndex: 500 }}>
          <Card tone="glass" padding="6px var(--space-3)">
            <span style={{ font: "var(--type-caption)", color: "var(--text-secondary)" }}>{caption}</span>
          </Card>
        </div>
      )}
    </div>
  );
});
