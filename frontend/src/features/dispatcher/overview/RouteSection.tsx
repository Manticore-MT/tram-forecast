import React from "react";
import type { ReactNode } from "react";
import { Button, Icon, Select, Stat } from "../../../components";
import { useLoadMatrix, useRouteForecast, type CommonParams } from "../../../api/hooks";
import { Panel } from "../../../shared/Panel";
import { pointLabel, windowLabel, type Scale } from "../time";
import { deviationPct, fmtInt, fmtPct, toneForPct } from "../format";
import { LineChart, LineLegend, type LineSeries } from "./LineChart";
import { openRoute } from "./network";
import { WeekHeatmap } from "./WeekHeatmap";
import { Empty, QueryGate } from "./QueryGate";

function Block({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="mt-eyebrow">{title}</div>
        {action}
      </div>
      {children}
    </div>
  );
}

export interface RouteSectionProps {
  /** Route ids from the network answer; undefined while it loads. */
  routeIds: string[] | undefined;
  params: CommonParams | undefined;
  scale: Scale;
  cursor: string;
}

export function RouteSection({ routeIds, params, scale, cursor }: RouteSectionProps) {
  const [picked, setPicked] = React.useState<string | undefined>(undefined);
  const routeId = picked && routeIds?.includes(picked) ? picked : routeIds?.[0];
  const forecast = useRouteForecast(routeId, params);
  const matrix = useLoadMatrix(routeId);

  const header = routeIds && routeIds.length > 0 && (
    <div className="flex items-center gap-3">
      <Select
        value={routeId}
        options={routeIds.map((id) => ({ value: id, label: `Маршрут № ${id}` }))}
        onChange={(e) => setPicked(e.target.value)}
        style={{ minWidth: "11rem" }}
      />
      {routeId && (
        <Button variant="secondary" size="sm" iconRight={<Icon name="arrow-right" size={14} />} onClick={() => openRoute(routeId)}>
          Открыть на карте
        </Button>
      )}
    </div>
  );

  return (
    <Panel title="Маршрут" action={header || undefined}>
      {routeIds === undefined ? <Empty>Список маршрутов появится, когда загрузится прогноз по сети</Empty> : routeIds.length === 0 ? <Empty>Нет маршрутов</Empty> : (
        <div className="grid gap-8 lg:grid-cols-2 2xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)_minmax(0,1.3fr)]">
          <FactVsForecast forecast={forecast} scale={scale} />
          <LastYear forecast={forecast} scale={scale} cursor={cursor} />
          <div className="lg:col-span-2 2xl:col-span-1">
            <Block title="Типичная неделя">
              <QueryGate q={matrix}>
                {() => {
                  const cells = matrix.data?.cells ?? [];
                  return cells.length === 0 ? <Empty>Нет данных о загрузке по часам</Empty> : <WeekHeatmap cells={cells} />;
                }}
              </QueryGate>
            </Block>
          </div>
        </div>
      )}
    </Panel>
  );
}

type ForecastQuery = ReturnType<typeof useRouteForecast>;

const FACT_SERIES = [
  { label: "факт", color: "var(--cyan-500)" },
  { label: "прогноз", color: "var(--brand-accent)" },
];

function FactVsForecast({ forecast, scale }: { forecast: ForecastQuery; scale: Scale }) {
  return (
    <Block title="Факт ↔ прогноз" action={<LineLegend series={FACT_SERIES} />}>
      <QueryGate q={forecast}>
        {() => {
          const points = forecast.data?.points ?? [];
          if (points.length === 0) return <Empty>Нет данных</Empty>;
          const series: LineSeries[] = [
            { ...FACT_SERIES[0], values: points.map((p) => p.actual ?? null) },
            { ...FACT_SERIES[1], values: points.map((p) => p.forecast ?? null) },
          ];
          const past = points.filter((p) => p.actual !== undefined);
          const fact = past.reduce((sum, p) => sum + (p.actual ?? 0), 0);
          const error = past.reduce((sum, p) => sum + Math.abs((p.actual ?? 0) - (p.forecast ?? 0)), 0);
          return (
            <>
              <LineChart
                ariaLabel="Факт и прогноз пассажиропотока по маршруту"
                series={series}
                labels={points.map((p) => pointLabel(scale, p.periodStart ?? ""))}
                height={200}
              />
              <span className="text-caption text-text-muted">
                {past.length === 0
                  ? "Факт появится, когда наступят периоды этого окна"
                  : fact > 0
                    ? `Ошибка на прошедших периодах окна: WAPE ${((error / fact) * 100).toFixed(1)} %`
                    : "Факт за прошедшие периоды нулевой — ошибку не посчитать"}
              </span>
            </>
          );
        }}
      </QueryGate>
    </Block>
  );
}

function LastYear({ forecast, scale, cursor }: { forecast: ForecastQuery; scale: Scale; cursor: string }) {
  return (
    <Block title="К прошлому году">
      <QueryGate q={forecast}>
        {() => {
          const points = forecast.data?.points ?? [];
          const lastYear = forecast.data?.lastYear ?? [];
          if (lastYear.length === 0) return <Empty>Нет данных за прошлый год</Empty>;
          const thisYear = points.reduce((sum, p) => sum + (p.forecast ?? p.actual ?? p.baseline ?? 0), 0);
          const before = lastYear.reduce((sum, p) => sum + (p.value ?? 0), 0);
          const pct = deviationPct(thisYear, before);
          return (
            <div className="flex flex-col gap-5">
              <Stat label="Прогноз за период" value={fmtInt(thisYear)} unit="пасс" caption={windowLabel(scale, cursor)} />
              <Stat label="Факт год назад" value={fmtInt(before)} unit="пасс" caption="те же периоды" />
              <Stat label="Изменение" value={fmtPct(pct)} tone={toneForPct(pct)} caption="год к году" />
            </div>
          );
        }}
      </QueryGate>
    </Block>
  );
}
