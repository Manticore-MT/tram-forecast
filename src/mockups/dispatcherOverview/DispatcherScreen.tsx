import React from "react";
import { Card, Stat, Icon, Tabs } from "../../components";
import { seedSeries, Sparkline } from "../../products/forecast-dashboard/Charts";
import { TRAM_ROUTES, DEFAULT_ROUTE } from "../../products/forecast-dashboard/MapScreens";
import { MapCanvas } from "../stopDetail/MapCanvas";
import { LoadLegend } from "../../products/forecast-dashboard/Shell";
import { DeviationList, FactorsCard } from "./shared";
import { DispatcherLevel, DrillTarget } from "./data";
import { networkZones, routeZones, networkDetail, routeDetail, stopDetail } from "./levelData";

/** Экран 1 — диспетчер. Вся сеть → маршрут → остановка — настоящая иерархия (US1-6):
 *  клик по пункту "Зоны внимания" или по объекту на карте спускается на уровень глубже,
 *  хлебные крошки сверху поднимают обратно. Карточки плавают поверх карты на весь экран. */
export function DispatcherScreen() {
  const [level, setLevel] = React.useState<DispatcherLevel>("all");
  const [route, setRoute] = React.useState(DEFAULT_ROUTE);
  const [stopIndex, setStopIndex] = React.useState(0);
  const [horizon, setHorizon] = React.useState("day");
  const [hour, setHour] = React.useState(18);
  const dynamics = React.useMemo(() => seedSeries(5, 24, 40, 60), [level, route, stopIndex]);

  const routeData = TRAM_ROUTES[route] ?? TRAM_ROUTES[DEFAULT_ROUTE];
  const zones = level === "all" ? networkZones() : level === "line" ? routeZones(routeData) : routeZones(routeData);
  const detail = level === "all" ? networkDetail() : level === "line" ? routeDetail(routeData) : stopDetail(routeData, Math.min(stopIndex, routeData.stops.length - 1));
  const mapCaption =
    level === "all" ? "вся сеть · 36 маршрутов"
      : level === "line" ? `маршрут № ${route} выделен`
        : `маршрут № ${route} · остановка «${routeData.stops[Math.min(stopIndex, routeData.stops.length - 1)]?.name}» выделена`;

  function drill(target?: DrillTarget) {
    if (!target) return;
    if (target.route) setRoute(target.route);
    if (target.stopIndex != null) setStopIndex(target.stopIndex);
    setLevel(target.level);
  }

  return (
    <div style={{ position: "relative", height: "100%", minHeight: 620, borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
      <MapCanvas
        level={level}
        route={route}
        caption={mapCaption}
        activeIndex={level === "stop" ? stopIndex : -1}
        onRouteClick={(r) => drill({ level: "line", route: r })}
        onPick={(i) => (level === "line" ? drill({ level: "stop", route, stopIndex: i }) : setStopIndex(i))}
        style={{ position: "absolute", inset: 0, borderRadius: 0 }}
      />

      <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 500 }}>
        <Card tone="glass" padding="var(--space-2) var(--space-4)">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", font: "var(--type-ui-s)" }}>
            <button onClick={() => setLevel("all")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit", color: level === "all" ? "var(--text-primary)" : "var(--text-muted)" }}>Вся сеть</button>
            {level !== "all" && <>
              <Icon name="chevron-right" size={14} />
              <button onClick={() => setLevel("line")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit", color: level === "line" ? "var(--text-primary)" : "var(--text-muted)" }}>Маршрут № {route}</button>
            </>}
            {level === "stop" && <>
              <Icon name="chevron-right" size={14} />
              <span style={{ color: "var(--text-primary)" }}>{routeData.stops[Math.min(stopIndex, routeData.stops.length - 1)]?.name}</span>
            </>}
          </div>
        </Card>
      </div>

      <div style={{ position: "absolute", top: 76, left: 16, width: 300, zIndex: 500 }}>
        <Card tone="glass" padding="var(--space-4)">
          <DeviationList title="Зоны внимания" items={zones} onSelect={drill} />
        </Card>
      </div>

      <div style={{ position: "absolute", top: 76, right: 16, width: 320, maxHeight: "calc(100% - 92px)", overflowY: "auto", zIndex: 500 }}>
        <Card tone="glass" padding="var(--space-6)" style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          <div className="mt-eyebrow">Детали</div>
          <div style={{ font: "var(--type-h4)" }}>{detail.title}</div>
          <div style={{ display: "flex", gap: "var(--space-6)" }}>
            <Stat label={detail.baselineLabel} value={detail.baselineValue} unit={detail.unit} />
            <Stat label={detail.forecastLabel} value={detail.forecastValue} unit={detail.unit} />
          </div>
          <Stat label="Отклонение" value={detail.deviationValue} tone="danger" />
          <div>
            <div className="mt-eyebrow" style={{ marginBottom: "var(--space-2)" }}>Динамика</div>
            <Sparkline data={dynamics} color="var(--accent)" />
          </div>
          <FactorsCard factors={detail.factors} />
        </Card>
      </div>

      <div style={{ position: "absolute", bottom: 16, left: 16, width: 360, zIndex: 500 }}>
        <Card tone="glass" padding="var(--space-5)">
          <div className="mt-eyebrow" style={{ marginBottom: "var(--space-3)" }}>Управление временем</div>
          <Tabs value={horizon} onChange={setHorizon} items={[{ value: "day", label: "день" }, { value: "month", label: "месяц" }, { value: "year", label: "год" }]} />
          <input type="range" min={5} max={23} step={1} value={hour} onChange={(e) => setHour(+e.target.value)}
            style={{ width: "100%", marginTop: "var(--space-4)", accentColor: "var(--accent)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", font: "var(--type-mono-s)", color: "var(--text-muted)" }}>
            <span>05:00</span>
            <span>{String(hour).padStart(2, "0")}:00</span>
            <span>23:00</span>
          </div>
        </Card>
      </div>

      <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", zIndex: 500 }}>
        <Card tone="glass" padding="var(--space-3) var(--space-4)"><LoadLegend /></Card>
      </div>
    </div>
  );
}
