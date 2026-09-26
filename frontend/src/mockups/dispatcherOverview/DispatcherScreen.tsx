import React from "react";
import { cn } from "@/lib/utils";
import { Card, Stat, Icon, Tabs } from "../../components";
import { Sparkline } from "../../products/forecast-dashboard/Charts";
import { TRAM_ROUTES, DEFAULT_ROUTE, DATASET_ROUTE_NUMBERS } from "../../products/forecast-dashboard/MapScreens";
import { MapCanvas } from "../stopDetail/MapCanvas";
import { LoadLegend, ErrorNotice, LoadingNotice } from "../../products/forecast-dashboard/Shell";
import { useAttention, useMeta, useRouteForecast, useRoutes, useStopForecast } from "../../api/hooks";
import type { CommonParams, Horizon } from "../../api/hooks";
import { DeviationList, FactorsCard } from "./shared";
import { DispatcherLevel, DrillTarget } from "./data";
import { zonesFromAttention, zonesFromRouteStops, detailFromNetwork, detailFromRoute, detailFromStop } from "./levelData";

/** Экран 1 — диспетчер. Вся сеть → маршрут → остановка (US1-6): клик по пункту "Зоны внимания"
 *  или по объекту на карте спускается на уровень глубже, хлебные крошки сверху поднимают обратно.
 *  Данные — из реального API (см. docs/frontend-integration.md); карта — из локальной геометрии
 *  data.mos.ru, сопоставленной с ответом API позиционно (по порядку остановок в маршруте), так как
 *  backend отдаёт непрозрачный stopId. */
export function DispatcherScreen() {
  const [level, setLevel] = React.useState<DispatcherLevel>("all");
  const [route, setRoute] = React.useState(DEFAULT_ROUTE);
  const [stopIndex, setStopIndex] = React.useState(0);
  const [horizon, setHorizon] = React.useState<Horizon>("day");
  const [hour, setHour] = React.useState(18);

  const metaQ = useMeta();
  const date = metaQ.data?.today;
  const params: CommonParams | undefined = date ? { horizon, date } : undefined;

  const networkQ = useRoutes(params ?? { horizon, date: "" });
  const attentionQ = useAttention(params ?? { horizon, date: "" });
  const routeForecastQ = useRouteForecast(date ? route : undefined, params ?? { horizon, date: "" });
  const stopId = routeForecastQ.data?.stops?.[stopIndex]?.stopId;
  const stopForecastQ = useStopForecast(level === "stop" ? route : undefined, level === "stop" ? stopId : undefined, params ?? { horizon, date: "" });

  const routeData = TRAM_ROUTES[route] ?? TRAM_ROUTES[DEFAULT_ROUTE];

  const zonesQ = level === "all" ? attentionQ : routeForecastQ;
  const zones = level === "all" ? zonesFromAttention(attentionQ.data?.zones ?? []) : zonesFromRouteStops(routeForecastQ.data);

  const detailQ = level === "all" ? networkQ : level === "line" ? routeForecastQ : stopForecastQ;
  const { detail, dynamics, recommendation } =
    level === "all" ? { ...detailFromNetwork(networkQ.data), recommendation: undefined }
      : level === "line" ? { ...detailFromRoute(routeForecastQ.data), recommendation: undefined }
        : detailFromStop(stopForecastQ.data);

  const mapCaption =
    level === "all" ? `вся сеть · ${DATASET_ROUTE_NUMBERS.length} маршрутов`
      : level === "line" ? `маршрут № ${route} выделен`
        : `маршрут № ${route} · остановка «${routeData.stops[Math.min(stopIndex, routeData.stops.length - 1)]?.name}» выделена`;

  function drill(target?: DrillTarget) {
    if (!target) return;
    if (target.route) setRoute(target.route);
    if (target.stopIndex != null) setStopIndex(target.stopIndex);
    setLevel(target.level);
  }

  if (!date) {
    return <div className="relative h-full min-h-155 rounded-xl overflow-hidden grid place-items-center"><LoadingNotice /></div>;
  }

  return (
    <div className="relative h-full min-h-155 rounded-xl overflow-hidden">
      <MapCanvas
        level={level}
        route={route}
        caption={mapCaption}
        activeIndex={level === "stop" ? stopIndex : -1}
        onRouteClick={(r) => drill({ level: "line", route: r })}
        onPick={(i) => (level === "line" ? drill({ level: "stop", route, stopIndex: i }) : setStopIndex(i))}
        onBackgroundClick={level !== "all" ? () => setLevel(level === "stop" ? "line" : "all") : undefined}
        style={{ position: "absolute", inset: 0, borderRadius: 0 }}
      />

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-500">
        <Card tone="glass" padding="var(--space-2) var(--space-4)">
          <div className="flex items-center gap-2 text-ui-s">
            <button onClick={() => setLevel("all")} className={cn("bg-transparent border-0 cursor-pointer p-0", level === "all" ? "text-text-primary" : "text-text-muted")}>Вся сеть</button>
            {level !== "all" && <>
              <Icon name="chevron-right" size={14} />
              <button onClick={() => setLevel("line")} className={cn("bg-transparent border-0 cursor-pointer p-0", level === "line" ? "text-text-primary" : "text-text-muted")}>Маршрут № {route}</button>
            </>}
            {level === "stop" && <>
              <Icon name="chevron-right" size={14} />
              <span className="text-text-primary">{routeData.stops[Math.min(stopIndex, routeData.stops.length - 1)]?.name}</span>
            </>}
          </div>
        </Card>
      </div>

      <div className="absolute top-19 left-4 w-75 z-500">
        <Card tone="glass" padding="var(--space-4)">
          {zonesQ.isError ? <ErrorNotice error={zonesQ.error} /> : !zonesQ.data ? <LoadingNotice /> : <DeviationList title="Зоны внимания" items={zones} onSelect={drill} />}
        </Card>
      </div>

      <div className="absolute top-19 right-4 w-80 max-h-[calc(100%-92px)] overflow-y-auto z-500">
        <Card tone="glass" padding="var(--space-6)" className="flex flex-col gap-5">
          <div className="mt-eyebrow">Детали</div>
          {detailQ.isError ? <ErrorNotice error={detailQ.error} /> : !detailQ.data ? <LoadingNotice /> : (
            <>
              <div className="text-h4">{detail.title}</div>
              <div className="flex gap-6">
                <Stat label={detail.baselineLabel} value={detail.baselineValue} unit={detail.unit} />
                <Stat label={detail.forecastLabel} value={detail.forecastValue} unit={detail.unit} />
              </div>
              <Stat label="Отклонение" value={detail.deviationValue} tone="danger" />
              {recommendation?.action && recommendation.action !== "NONE" && (
                <Stat label="Рекомендация" value={recommendation.action === "ADD_VEHICLE" ? `+${recommendation.vehicles ?? 1} трамвай` : `−${recommendation.vehicles ?? 1} трамвай`} />
              )}
              {dynamics.length > 1 && (
                <div>
                  <div className="mt-eyebrow mb-2">Динамика</div>
                  <Sparkline data={dynamics} color="var(--brand-accent)" />
                </div>
              )}
              {detail.factors.length > 0 && <FactorsCard factors={detail.factors} />}
            </>
          )}
        </Card>
      </div>

      <div className="absolute bottom-4 left-4 w-90 z-500">
        <Card tone="glass" padding="var(--space-5)">
          <div className="mt-eyebrow mb-3">Управление временем</div>
          <Tabs value={horizon} onChange={(v) => setHorizon(v as Horizon)} items={[{ value: "day", label: "день" }, { value: "month", label: "месяц" }, { value: "year", label: "год" }]} />
          <input type="range" min={5} max={23} step={1} value={hour} onChange={(e) => setHour(+e.target.value)}
            className="w-full mt-4 accent-brand" />
          <div className="flex justify-between text-mono-s text-text-muted">
            <span>05:00</span>
            <span>{String(hour).padStart(2, "0")}:00</span>
            <span>23:00</span>
          </div>
        </Card>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-500">
        <Card tone="glass" padding="var(--space-3) var(--space-4)"><LoadLegend /></Card>
      </div>
    </div>
  );
}
