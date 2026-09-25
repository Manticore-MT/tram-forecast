import React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/leaflet-dark.css";
import { Card } from "../../components";
import { TRAM_ROUTES, DEFAULT_ROUTE, hexFor } from "../../products/forecast-dashboard/MapScreens";
import type { Level } from "./data";

export interface MapCanvasProps {
  level: Level;
  caption: string;
  /** Route shown at "line"/"stop" levels — ignored at "all". Defaults to DEFAULT_ROUTE. */
  route?: string;
  activeIndex: number;
  /** Stop clicked on the map at "line"/"stop" — lets the caller drill down the hierarchy. */
  onPick?: (i: number) => void;
  /** Route clicked on the map at "all" — lets the caller drill into that route. */
  onRouteClick?: (routeNumber: string) => void;
  style?: React.CSSProperties;
}

/** Same real Leaflet/OSM basemap as products/forecast-dashboard/MapScreens.tsx — reused here so the
 *  mockups show an actual map, not a stand-in. Only the marker/line treatment differs per level. */
export function MapCanvas({ level, caption, route, activeIndex, onPick, onRouteClick, style }: MapCanvasProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<L.Map | null>(null);
  const layerRef = React.useRef<L.LayerGroup | null>(null);
  const stops = (TRAM_ROUTES[route ?? DEFAULT_ROUTE] ?? TRAM_ROUTES[DEFAULT_ROUTE]).stops;

  React.useEffect(() => {
    if (mapRef.current || !ref.current) return;
    const el = ref.current;
    const map = L.map(el, { zoomControl: false, attributionControl: true }).setView([55.779, 37.699], 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors" }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapRef.current = map;
    const sync = () => { map.invalidateSize(false); };
    requestAnimationFrame(sync);
    setTimeout(sync, 0);
    const started = Date.now();
    const poll = setInterval(() => {
      sync();
      const size = map.getSize();
      if (size.x > 0 && size.y > 0) clearInterval(poll);
      else if (Date.now() - started > 4000) clearInterval(poll);
    }, 120);
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(sync) : null;
    if (ro) { ro.observe(el); if (el.parentElement) ro.observe(el.parentElement); }
    window.addEventListener("resize", sync);
    return () => { clearInterval(poll); if (ro) ro.disconnect(); window.removeEventListener("resize", sync); map.remove(); mapRef.current = null; };
  }, []);

  React.useEffect(() => {
    const map = mapRef.current; if (!map) return;
    if (layerRef.current) layerRef.current.remove();
    const g = L.layerGroup();

    if (level === "all") {
      // Real network overview: every tram route's real stop sequence, colored by load —
      // click a route to drill into it (US1: вся сеть → маршрут).
      const allStops: [number, number][] = [];
      for (const r of Object.values(TRAM_ROUTES)) {
        for (let i = 0; i < r.stops.length - 1; i++) {
          L.polyline([r.stops[i].ll, r.stops[i + 1].ll], { color: hexFor(r.stops[i].load), weight: 3, opacity: 0.8 })
            .on("click", () => onRouteClick && onRouteClick(r.number))
            .addTo(g);
        }
        for (const s of r.stops) allStops.push(s.ll);
      }
      map.fitBounds(allStops, { padding: [24, 24] });
    } else {
      map.fitBounds(stops.map((s) => s.ll), { padding: [48, 48], maxZoom: 15 });
      for (let i = 0; i < stops.length - 1; i++) {
        const color = level === "line" ? "#F0392B" : hexFor(stops[i].load);
        L.polyline([stops[i].ll, stops[i + 1].ll], { color, weight: 6, opacity: 0.85 }).addTo(g);
      }
      // Individual stop markers only make sense once a single route is in view —
      // at "all" 1129 stops citywide would just clutter (and previously drew only one
      // arbitrary route's dots on top of every other route's line).
      stops.forEach((s, i) => {
        const isActive = i === activeIndex;
        L.circleMarker(s.ll, { radius: isActive ? 11 : 7, color: "#0E1113", weight: 2, fillColor: hexFor(s.load), fillOpacity: 1 })
          .bindTooltip(`${s.name} · ${Math.round(s.load * 100)} %`, { direction: "top" })
          .on("click", () => onPick && onPick(i))
          .addTo(g);
      });
    }
    g.addTo(map);
    layerRef.current = g;
  }, [level, route, activeIndex, onPick, onRouteClick]);

  return (
    <div style={{ position: "relative", isolation: "isolate", zIndex: 0, flex: 1, minHeight: 220, borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--inset-hairline)", ...style }}>
      <div ref={ref} style={{ position: "absolute", inset: 0, background: "var(--ink-800)" }} />
      <div style={{ position: "absolute", left: 12, bottom: 12, zIndex: 500 }}>
        <Card tone="glass" padding="6px var(--space-3)">
          <span style={{ font: "var(--type-caption)", color: "var(--text-secondary)" }}>{caption}</span>
        </Card>
      </div>
    </div>
  );
}
