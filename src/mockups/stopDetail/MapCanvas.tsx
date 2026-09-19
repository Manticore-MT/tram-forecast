import React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/leaflet-dark.css";
import { Card } from "../../components";
import { GEO, hexFor } from "../../products/forecast-dashboard/MapScreens";
import type { Level } from "./data";

export interface MapCanvasProps {
  level: Level;
  caption: string;
  activeIndex: number;
  style?: React.CSSProperties;
}

/** Same real Leaflet/OSM basemap as products/forecast-dashboard/MapScreens.tsx — reused here so the
 *  mockups show an actual map, not a stand-in. Only the marker/line treatment differs per level. */
export function MapCanvas({ level, caption, activeIndex, style }: MapCanvasProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<L.Map | null>(null);
  const layerRef = React.useRef<L.LayerGroup | null>(null);

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
    map.setView([55.779, 37.699], level === "all" ? 12 : 13);

    for (let i = 0; i < GEO.length - 1; i++) {
      const color = level === "line" ? "#F0392B" : level === "all" ? "#49555D" : hexFor(GEO[i].load);
      L.polyline([GEO[i].ll, GEO[i + 1].ll], { color, weight: level === "all" ? 3 : 6, opacity: level === "all" ? 0.5 : 0.85 }).addTo(g);
    }
    GEO.forEach((s, i) => {
      const isActive = level === "stop" && i === activeIndex;
      const fill = level === "all" ? "#697680" : hexFor(s.load);
      L.circleMarker(s.ll, { radius: isActive ? 11 : level === "all" ? 6 : 7, color: "#0E1113", weight: 2, fillColor: fill, fillOpacity: level === "all" ? 0.7 : 1 })
        .bindTooltip(`${s.name}${level !== "all" ? ` · ${Math.round(s.load * 100)} %` : ""}`, { direction: "top" })
        .addTo(g);
    });
    g.addTo(map);
    layerRef.current = g;
  }, [level, activeIndex]);

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
