import React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/leaflet-dark.css";
import { Card, Badge, Button, Icon, Stat, LoadMeter, Switch } from "../../components";
import { Panel, LoadLegend, ErrorNotice } from "./Shell";
import { useRouteForecast } from "../../api/hooks";
import tramNetworkRaw from "../../data/tram-network.json";

export interface TramStop {
  name: string;
  ll: [number, number];
  /** Organizers' own stop code ("Код остановки" in the raw dataset) — the id to match
   *  against the backend's stopId once it's wired to real (non-stub) data, instead of
   *  positional-index guessing. See docs/open-questions.md for the open confirmation with backend/ML. */
  stopCode?: string;
  load: number;
}

export interface TramRoute {
  number: string;
  name: string;
  stops: TramStop[];
}

interface RawStop {
  name: string;
  ll: [number, number];
  stopCode?: string;
}

interface RawRoute {
  number: string;
  name: string;
  stops: RawStop[];
}

/** Deterministic pseudo-load per stop (0.2–0.85) — stands in for real ridership until
 *  ЕДЦ provides one; stable across renders so the same stop always looks the same. */
function loadFor(name: string, seed: number): number {
  let h = seed >>> 0;
  for (let i = 0; i < name.length; i++) h = (Math.imul(h, 31) + name.charCodeAt(i)) >>> 0;
  return 0.2 + ((h % 1000) / 1000) * 0.65;
}

/** The hackathon dataset only covers these 9 routes — tram-network.json has 36 (sourced
 *  from data.mos.ru independently of the ML/backend dataset), so the extra ones are
 *  filtered out here rather than in the JSON file itself. */
export const DATASET_ROUTE_NUMBERS = ["1", "7", "11", "12", "17", "25", "26", "28", "50"];

/** Real Moscow tram network — stop positions and track order sourced from data.mos.ru
 *  (остановки + расписание рейсов), joined by scripts/build-tram-network.mjs into
 *  src/data/tram-network.json. The connector between consecutive stops is still a
 *  straight segment, not surveyed track geometry; load values are synthetic. */
export const TRAM_ROUTES: Record<string, TramRoute> = Object.fromEntries(
  (tramNetworkRaw as RawRoute[])
    .filter((r) => DATASET_ROUTE_NUMBERS.includes(r.number))
    .map((r) => [
      r.number,
      { number: r.number, name: r.name, stops: r.stops.map((s, i) => ({ ...s, load: loadFor(s.name, i * 7 + r.number.length) })) },
    ]),
);

/** The API's routeId is the route number as a string ("1", "17") — build it from `number`, never from tram-network.json's internal id. */
export const toRouteId = (number: string) => number;

export const TRAM_ROUTE_NUMBERS = Object.keys(TRAM_ROUTES);
export const DEFAULT_ROUTE = "17";
/** @deprecated kept for callers that render one fixed route without a selector — prefer TRAM_ROUTES[route].stops */
export const GEO = TRAM_ROUTES[DEFAULT_ROUTE].stops;

export const LOAD_HEX = ["#2ED47A", "#A3E635", "#FFB020", "#FB7B3C", "#F0392B"];
export const hexFor = (v: number) => LOAD_HEX[Math.min(4, Math.floor(v * 5))];

export interface MapStop extends TramStop {
  v: number;
  forecast?: number;
}

interface MapCanvasProps {
  stops: MapStop[];
  active: number;
  onPick?: (i: number) => void;
}

export function MapCanvas({ stops, onPick, active }: MapCanvasProps) {
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
    // The container is absolutely positioned, so its height can still be 0 at mount —
    // Leaflet would cache a 0×0 size and never draw tiles or overlays.
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
    for (let i = 0; i < stops.length - 1; i++) {
      L.polyline([stops[i].ll, stops[i + 1].ll], { color: hexFor(stops[i].v), weight: 6, opacity: 0.85, dashArray: "1 0" }).addTo(g);
    }
    stops.forEach((s, i) => {
      L.circleMarker(s.ll, { radius: i === active ? 11 : 7, color: "#0E1113", weight: 2, fillColor: hexFor(s.v), fillOpacity: 1 })
        .bindTooltip(`${s.name} · ${Math.round(s.v * 100)} %`, { direction: "top" })
        .on("click", () => onPick && onPick(i)).addTo(g);
    });
    g.addTo(map);
    layerRef.current = g;
  }, [stops, active, onPick]);

  React.useEffect(() => {
    const map = mapRef.current; if (!map || stops.length === 0) return;
    map.fitBounds(stops.map((s) => s.ll), { padding: [48, 48], maxZoom: 15 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops.map((s) => s.name).join(",")]);

  return <div ref={ref} style={{ position: "absolute", inset: 0, isolation: "isolate", background: "var(--ink-800)" }} />;
}

/** Synthetic fallback shift used only while the real forecast hasn't loaded yet or failed. */
function peakShift(hour: number): number {
  return Math.exp(-Math.pow((hour - 8.5) / 3, 2)) + 0.9 * Math.exp(-Math.pow((hour - 18.5) / 3.2, 2));
}

/** Combines local stop geometry (name, ll — from data.mos.ru) with the backend's per-stop
 *  forecast (opaque stopId, so matched positionally: both are ordered along the route).
 *  Falls back to a synthetic time-of-day curve while the real data hasn't loaded yet. */
export function useMapStops(route: string, hour: number, date: string): { stops: MapStop[]; isLoading: boolean; isError: boolean; error: unknown } {
  const localStops = (TRAM_ROUTES[route] ?? TRAM_ROUTES[DEFAULT_ROUTE]).stops;
  const { data, isLoading, isError, error } = useRouteForecast(route, { horizon: "day", date });
  const backendStops = data?.stops ?? [];
  const hourIndex = Math.max(0, Math.min(23, Math.round(hour)));
  const maxForecast = React.useMemo(() => {
    let max = 0;
    for (const bs of backendStops) for (const p of bs.points ?? []) if ((p.forecast ?? 0) > max) max = p.forecast!;
    return max;
  }, [backendStops]);
  const stops = React.useMemo(
    () =>
      localStops.map((ls, i) => {
        const forecast = backendStops[i]?.points?.[hourIndex]?.forecast;
        const v =
          forecast !== undefined && maxForecast > 0
            ? Math.max(0.05, Math.min(1, forecast / maxForecast))
            : Math.max(0.05, Math.min(1, ls.load * (0.35 + 0.8 * peakShift(hour))));
        return { ...ls, v, forecast };
      }),
    [localStops, backendStops, hourIndex, maxForecast, hour],
  );
  return { stops, isLoading, isError, error };
}

export interface MapViewProps {
  route: string;
  date: string;
}

export function MapView({ route, date }: MapViewProps) {
  const [hour, setHour] = React.useState(18);
  const [active, setActive] = React.useState(0);
  const [live, setLive] = React.useState(true);
  const { stops, isLoading, isError, error } = useMapStops(route, hour, date);
  React.useEffect(() => { setActive(0); }, [route]);
  const s = stops[Math.min(active, stops.length - 1)];
  const label = `${String(Math.floor(hour)).padStart(2, "0")}:${hour % 1 ? "30" : "00"}`;
  return (
    <div style={{ position: "relative", height: "100%", minHeight: 620, borderRadius: "var(--radius-xl)", overflow: "hidden", boxShadow: "var(--inset-hairline)" }}>
      <MapCanvas stops={stops} active={active} onPick={setActive} />
      <div style={{ position: "absolute", top: 16, left: 16, width: 320, display: "flex", flexDirection: "column", gap: "var(--space-3)", zIndex: 500 }}>
        <Card tone="glass" padding="var(--space-5)">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)" }}>
            <div>
              <div className="mt-eyebrow">Маршрут {route} · прогноз</div>
              <div style={{ marginTop: 6, font: "var(--type-h3)" }}>{label}</div>
            </div>
            <Badge tone={live ? "ok" : "neutral"} dot>{live ? "live" : "пауза"}</Badge>
          </div>
          <input type="range" min="5" max="23" step="1" value={hour} onChange={(e) => setHour(+e.target.value)}
            style={{ width: "100%", marginTop: "var(--space-4)", accentColor: "var(--brand-accent)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", font: "var(--type-mono-s)", color: "var(--text-muted)" }}><span>05:00</span><span>23:00</span></div>
          <div style={{ marginTop: "var(--space-4)" }}><Switch checked={live} onChange={() => setLive(!live)} label="Обновлять в реальном времени" /></div>
          {isError && <div style={{ marginTop: "var(--space-3)" }}><ErrorNotice error={error} /></div>}
        </Card>
        {s && (
          <Card tone="glass" padding="var(--space-5)">
            <div className="mt-eyebrow">Остановка</div>
            <div style={{ marginTop: 6, font: "var(--type-h4)" }}>{s.name}</div>
            <div style={{ marginTop: "var(--space-4)" }}><LoadMeter value={s.v} /></div>
            <div style={{ marginTop: "var(--space-4)", display: "flex", gap: "var(--space-6)" }}>
              <Stat label="Прогноз, пасс/ч" value={s.forecast !== undefined ? Math.round(s.forecast).toLocaleString("ru-RU") : isLoading ? "…" : "—"} />
            </div>
          </Card>
        )}
      </div>
      <div style={{ position: "absolute", bottom: 16, left: 16, zIndex: 500 }}>
        <Card tone="glass" padding="var(--space-4)"><LoadLegend /></Card>
      </div>
      <div style={{ position: "absolute", top: 16, right: 16, zIndex: 500 }}>
        <Card tone="glass" padding="var(--space-4)" style={{ maxWidth: 260 }}>
          <div style={{ font: "var(--type-caption)", color: "var(--text-secondary)" }}>Остановки и их порядок — реальные (data.mos.ru). Линия между ними — прямая, не путь по рельсам.</div>
        </Card>
      </div>
    </div>
  );
}

export interface DemandMapProps {
  route: string;
  date: string;
  height?: number;
}

/** Compact, read-only variant of MapCanvas — the predicted-demand strip for the Overview screen. */
export function DemandMap({ route, date, height = 260 }: DemandMapProps) {
  const { stops } = useMapStops(route, 18, date);
  return (
    <div style={{ position: "relative", height, borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--inset-hairline)" }}>
      <MapCanvas stops={stops} active={-1} />
      <div style={{ position: "absolute", top: 12, left: 12, zIndex: 500 }}>
        <Card tone="glass" padding="var(--space-3) var(--space-4)">
          <span style={{ font: "var(--type-caption)", color: "var(--text-secondary)" }}>Прогноз спроса · 18:00</span>
        </Card>
      </div>
    </div>
  );
}

export function IngestView() {
  const jobs: [string, string, "ok" | "warn", string, string][] = [
    ["validations_hourly", "валидации · Кафка → ClickHouse", "ok", "12 с", "4.2 млрд строк"],
    ["telematics_stream", "телематика ГЛОНАСС · Netty", "ok", "4 с", "118 млн/сут"],
    ["weather_enrich", "погода · внешний API", "warn", "18 мин", "1.2 млн"],
    ["events_calendar", "события в городе", "ok", "1 ч", "48 тыс."],
    ["feature_store_build", "построение признаков", "ok", "04:00", "2 700 признаков"],
  ];
  const quality: [string, number][] = [["Пропуски валидаций", 0.006], ["Дубли транзакций", 0.002], ["Остановки без привязки", 0.014], ["Выбросы телематики", 0.021]];
  const api: [string, string, string][] = [
    ["GET", "/api/routes/{routeId}/forecast?horizon=day", "p95 84 мс"],
    ["GET", "/api/routes/{routeId}/stops/{stopId}/forecast", "p95 61 мс"],
    ["GET", "/api/routes", "p95 12 мс"],
    ["GET", "/api/model/stats", "p95 9 мс"],
  ];
  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--space-5)" }}>
        <Card tone="surface"><Stat label="Валидаций в базе" value="4.2" unit="млрд" caption="2022 — 2026" /></Card>
        <Card tone="surface"><Stat label="Строк за сутки" value="118" unit="млн" trend={{ dir: "up", value: "3.1 %" }} /></Card>
        <Card tone="surface"><Stat label="Задержка потока" value="12" unit="с" trend={{ dir: "down", value: "4 с" }} /></Card>
        <Card tone="surface"><Stat label="Полнота данных" value="99.4" unit="%" caption="за 24 часа" /></Card>
      </div>
      <Panel title="Пайплайны" action={<Button size="sm" variant="secondary" iconLeft={<Icon name="refresh-cw" size={14} />}>Перезапустить</Button>}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {jobs.map(([id, desc, tone, lag, vol]) => (
            <div key={id} style={{ display: "grid", gridTemplateColumns: "220px 1fr 110px 90px 140px", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-4)", background: "var(--bg-surface-2)", borderRadius: "var(--radius-md)", boxShadow: "var(--inset-hairline)" }}>
              <span style={{ font: "var(--type-mono-s)", color: "var(--text-primary)" }}>{id}</span>
              <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{desc}</span>
              <Badge tone={tone} dot>{tone === "ok" ? "в работе" : "отставание"}</Badge>
              <span style={{ font: "var(--type-mono-s)", color: "var(--text-muted)" }}>{lag}</span>
              <span style={{ font: "var(--type-mono-s)", color: "var(--text-secondary)", textAlign: "right" }}>{vol}</span>
            </div>
          ))}
        </div>
      </Panel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
        <Panel title="Качество данных">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {quality.map(([k, v]) => (
              <div key={k} style={{ display: "grid", gridTemplateColumns: "1fr 120px 60px", alignItems: "center", gap: "var(--space-4)" }}>
                <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{k}</span>
                <span style={{ height: 8, borderRadius: 2, background: "var(--ink-600)", overflow: "hidden" }}><span style={{ display: "block", width: `${Math.min(100, v * 2000)}%`, height: "100%", background: v > 0.015 ? "var(--status-warn)" : "var(--status-ok)" }} /></span>
                <span style={{ font: "var(--type-mono-s)", color: "var(--text-muted)", textAlign: "right" }}>{(v * 100).toFixed(2)} %</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="API прогноза" action={<Badge tone="info">Spring Boot · Netty</Badge>}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", font: "var(--type-mono-s)" }}>
            {api.map(([m, p, l]) => (
              <div key={p} style={{ display: "grid", gridTemplateColumns: "56px 1fr 90px", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) var(--space-4)", background: "var(--bg-surface-2)", borderRadius: "var(--radius-sm)", boxShadow: "var(--inset-hairline)" }}>
                <span style={{ color: m === "POST" ? "var(--text-accent)" : "var(--status-info)" }}>{m}</span>
                <span style={{ color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis" }}>{p}</span>
                <span style={{ color: "var(--text-muted)", textAlign: "right" }}>{l}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
