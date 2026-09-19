import React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, Badge, Button, Icon, Stat, LoadMeter, Switch } from "../../components";
import { Panel, LoadLegend } from "./Shell";

/** Real OSM basemap of Moscow. Stop positions are approximate coordinates of the named
 *  landmarks; the connector line is a straight-segment stand-in, NOT surveyed track geometry.
 *  Replace GEO with real route geometry when ЕДЦ provides it. */
export const GEO: { name: string; ll: [number, number]; load: number }[] = [
  { name: "Метро Сокольники", ll: [55.7893, 37.6797], load: 0.34 },
  { name: "Стромынка", ll: [55.7867, 37.6945], load: 0.52 },
  { name: "Матросская Тишина", ll: [55.7842, 37.7000], load: 0.61 },
  { name: "Электрозаводская", ll: [55.7820, 37.7053], load: 0.86 },
  { name: "Площадь Журавлёва", ll: [55.7789, 37.7085], load: 0.74 },
  { name: "Госпитальный Вал", ll: [55.7735, 37.7010], load: 0.48 },
  { name: "Лефортово", ll: [55.7660, 37.7050], load: 0.29 },
];

const LOAD_HEX = ["#2ED47A", "#A3E635", "#FFB020", "#FB7B3C", "#F0392B"];
const hexFor = (v: number) => LOAD_HEX[Math.min(4, Math.floor(v * 5))];

interface MapCanvasProps {
  hour: number;
  active: number;
  onPick?: (i: number) => void;
}

function MapCanvas({ hour, onPick, active }: MapCanvasProps) {
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
    const shift = Math.exp(-Math.pow((hour - 8.5) / 3, 2)) + 0.9 * Math.exp(-Math.pow((hour - 18.5) / 3.2, 2));
    const pts = GEO.map((s) => ({ ...s, v: Math.max(0.05, Math.min(1, s.load * (0.35 + 0.8 * shift))) }));
    for (let i = 0; i < pts.length - 1; i++) {
      L.polyline([pts[i].ll, pts[i + 1].ll], { color: hexFor(pts[i].v), weight: 6, opacity: 0.85, dashArray: "1 0" }).addTo(g);
    }
    pts.forEach((s, i) => {
      L.circleMarker(s.ll, { radius: i === active ? 11 : 7, color: "#0E1113", weight: 2, fillColor: hexFor(s.v), fillOpacity: 1 })
        .bindTooltip(`${s.name} · ${Math.round(s.v * 100)} %`, { direction: "top" })
        .on("click", () => onPick && onPick(i)).addTo(g);
    });
    g.addTo(map);
    layerRef.current = g;
  }, [hour, active, onPick]);

  return <div ref={ref} style={{ position: "absolute", inset: 0, background: "var(--ink-800)" }} />;
}

export interface MapViewProps {
  route: string;
}

export function MapView({ route }: MapViewProps) {
  const [hour, setHour] = React.useState(18);
  const [active, setActive] = React.useState(3);
  const [live, setLive] = React.useState(true);
  const s = GEO[active];
  const label = `${String(Math.floor(hour)).padStart(2, "0")}:${hour % 1 ? "30" : "00"}`;
  return (
    <div style={{ position: "relative", height: "100%", minHeight: 620, borderRadius: "var(--radius-xl)", overflow: "hidden", boxShadow: "var(--inset-hairline)" }}>
      <MapCanvas hour={hour} active={active} onPick={setActive} />
      <div style={{ position: "absolute", top: 16, left: 16, width: 320, display: "flex", flexDirection: "column", gap: "var(--space-3)", zIndex: 500 }}>
        <Card tone="glass" padding="var(--space-5)">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)" }}>
            <div>
              <div className="mt-eyebrow">Маршрут {route} · прогноз</div>
              <div style={{ marginTop: 6, font: "var(--type-h3)" }}>{label}</div>
            </div>
            <Badge tone={live ? "ok" : "neutral"} dot>{live ? "live" : "пауза"}</Badge>
          </div>
          <input type="range" min="5" max="23.5" step="0.5" value={hour} onChange={(e) => setHour(+e.target.value)}
            style={{ width: "100%", marginTop: "var(--space-4)", accentColor: "var(--accent)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", font: "var(--type-mono-s)", color: "var(--text-muted)" }}><span>05:00</span><span>23:30</span></div>
          <div style={{ marginTop: "var(--space-4)" }}><Switch checked={live} onChange={() => setLive(!live)} label="Обновлять в реальном времени" /></div>
        </Card>
        <Card tone="glass" padding="var(--space-5)">
          <div className="mt-eyebrow">Остановка</div>
          <div style={{ marginTop: 6, font: "var(--type-h4)" }}>{s.name}</div>
          <div style={{ marginTop: "var(--space-4)" }}><LoadMeter value={s.load} /></div>
          <div style={{ marginTop: "var(--space-4)", display: "flex", gap: "var(--space-6)" }}>
            <Stat label="Вход/час" value="1 240" />
            <Stat label="Интервал" value="6.5" unit="мин" />
          </div>
        </Card>
      </div>
      <div style={{ position: "absolute", bottom: 16, left: 16, zIndex: 500 }}>
        <Card tone="glass" padding="var(--space-4)"><LoadLegend /></Card>
      </div>
      <div style={{ position: "absolute", top: 16, right: 16, zIndex: 500 }}>
        <Card tone="glass" padding="var(--space-4)" style={{ maxWidth: 260 }}>
          <div style={{ font: "var(--type-caption)", color: "var(--text-secondary)" }}>Геометрия трассы — прямые отрезки между остановками. Подставьте реальные данные ЕДЦ.</div>
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
    ["GET", "/api/v1/forecast?route=17&horizon=day", "p95 84 мс"],
    ["GET", "/api/v1/forecast/stop/{id}?from&to", "p95 61 мс"],
    ["GET", "/api/v1/routes", "p95 12 мс"],
    ["POST", "/api/v1/model/retrain", "async"],
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
