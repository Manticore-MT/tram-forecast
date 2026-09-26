import { useState } from "react";
import { Badge, Select, Timeline } from "../../components";
import { useAttention, useMeta, useModelStats, useRouteForecast, useRoutes, type CommonParams } from "../../api/hooks";
import { ForecastChart } from "../../shared/charts";
import { Panel } from "../../shared/Panel";
import { ErrorNotice, LoadingNotice } from "../../shared/notices";
import { MapCanvas } from "./map/MapCanvas";
import { zonesFromAttention } from "./panels/AttentionPanel";
import { MetricCard, DeviationList } from "./shared";
import { deviationPct, fmtInt, fmtPct } from "./format";

function lastForecastSum(routes: { points?: { forecast?: number }[] }[] | undefined): number {
  return (routes ?? []).reduce((sum, r) => sum + (r.points?.[r.points.length - 1]?.forecast ?? 0), 0);
}

function routeLabel(routeId: string): string {
  return `Маршрут ${routeId}`;
}

/** Экран «Обзор» для стейкхолдера: сетка карточек, без карты на весь экран. */
export function OverviewScreen() {
  const [pickedRoute, setPickedRoute] = useState<string | undefined>(undefined);

  const date = useMeta().data?.today;
  const dayParams: CommonParams | undefined = date ? { horizon: "day", date } : undefined;
  const yearParams: CommonParams | undefined = date ? { horizon: "year", date } : undefined;

  const networkQ = useRoutes(dayParams);
  const yearNetworkQ = useRoutes(yearParams);
  const attentionQ = useAttention(dayParams);
  const modelStatsQ = useModelStats(30);

  const routes = networkQ.data?.routes ?? [];
  const routeOptions = routes.filter((r) => r.routeId).map((r) => ({ value: r.routeId!, label: routeLabel(r.routeId!) }));
  const routeId = pickedRoute ?? routeOptions[0]?.value;
  const noRoutes = networkQ.isSuccess && routeOptions.length === 0;

  const routeForecastQ = useRouteForecast(routeId, dayParams);

  if (!date) return <LoadingNotice />;

  const points = routeForecastQ.data?.points ?? [];
  const splitIdx = points.findIndex((p) => p.actual === undefined);
  const cutoff = splitIdx === -1 ? points.length : splitIdx;
  const actual = points.slice(0, cutoff).map((p) => p.actual ?? p.baseline ?? 0);
  const forecast = points.slice(cutoff).map((p) => p.forecast ?? p.baseline ?? 0);

  const lastYear = routeForecastQ.data?.lastYear ?? [];
  const hasLastYear = lastYear.length > 0;
  const thisYearTotal = points.reduce((sum, p) => sum + (p.forecast ?? p.actual ?? p.baseline ?? 0), 0);
  const lastYearTotal = lastYear.reduce((sum, p) => sum + (p.value ?? 0), 0);
  const yoyPct = deviationPct(thisYearTotal, lastYearTotal);

  return (
    <div className="grid gap-6">
      <Panel title="Прогноз по сети">
        <div className="grid grid-cols-2 gap-5">
          <div className="grid grid-cols-2 content-start gap-5">
            {networkQ.isError ? <ErrorNotice error={networkQ.error} onRetry={() => void networkQ.refetch()} /> : (
              <MetricCard label="Прогноз, последний час" value={networkQ.isLoading ? "…" : fmtInt(lastForecastSum(networkQ.data?.routes))} unit="пасс/ч" caption="по сети" />
            )}
            {yearNetworkQ.isError ? <ErrorNotice error={yearNetworkQ.error} onRetry={() => void yearNetworkQ.refetch()} /> : (
              <MetricCard label="Долгосрочный прогноз" value={yearNetworkQ.isLoading ? "…" : fmtInt(lastForecastSum(yearNetworkQ.data?.routes))} unit="пасс/мес" caption="на конец года" />
            )}
          </div>
          <MapCanvas place={{ level: "network" }} caption="Маршруты датасета" className="min-h-65 rounded-lg shadow-(--inset-hairline)" />
        </div>
      </Panel>

      <Panel title="Проблемные места">
        {attentionQ.isError ? <ErrorNotice error={attentionQ.error} onRetry={() => void attentionQ.refetch()} /> : attentionQ.isLoading ? <LoadingNotice /> : (
          <DeviationList title="Рейтинг зон внимания" items={zonesFromAttention(attentionQ.data?.zones ?? [], "day", 5)} layout="table" />
        )}
      </Panel>

      <Panel title="К прошлому году" action={routeId ? <Badge tone="neutral">{routeLabel(routeId)}</Badge> : undefined}>
        {networkQ.isError ? <ErrorNotice error={networkQ.error} onRetry={() => void networkQ.refetch()} /> : noRoutes ? (
          <div className="text-body-s text-text-muted">Нет маршрутов</div>
        ) : routeForecastQ.isError ? <ErrorNotice error={routeForecastQ.error} onRetry={() => void routeForecastQ.refetch()} /> : routeForecastQ.isLoading || networkQ.isLoading ? <LoadingNotice /> : !hasLastYear ? (
          <div className="text-body-s text-text-muted">Нет данных за прошлый год</div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            <MetricCard label="Прогноз, сегодня" value={fmtInt(thisYearTotal)} unit="пасс/ч" caption="сумма за сутки" />
            <MetricCard label="Факт, год назад" value={fmtInt(lastYearTotal)} unit="пасс/ч" caption="те же периоды" />
            <MetricCard label="Изменение" value={fmtPct(yoyPct)} trend={{ dir: yoyPct >= 0 ? "up" : "down", value: fmtPct(yoyPct) }} caption="год к году" />
          </div>
        )}
      </Panel>

      <Panel
        title="Качество прогноза"
        action={noRoutes ? undefined : (
          <Select
            value={routeId}
            onChange={(e) => setPickedRoute(e.target.value)}
            options={routeOptions}
            disabled={networkQ.isLoading || routeOptions.length === 0}
            style={{ minWidth: "10rem" }}
          />
        )}
      >
        <div className="grid grid-cols-[1.6fr_1fr] gap-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-5">
              <span className="inline-flex items-center gap-1.5 text-caption text-text-muted"><span className="h-0.5 w-3.5 bg-cyan-500" />факт</span>
              <span className="inline-flex items-center gap-1.5 text-caption text-text-muted"><span className="h-0.5 w-3.5 bg-brand" />прогноз</span>
            </div>
            {noRoutes ? (
              <div className="text-body-s text-text-muted">Нет маршрутов</div>
            ) : routeForecastQ.isError ? <ErrorNotice error={routeForecastQ.error} onRetry={() => void routeForecastQ.refetch()} /> : routeForecastQ.isLoading || networkQ.isLoading ? <LoadingNotice /> : points.length === 0 ? (
              <div className="text-body-s text-text-muted">Нет данных</div>
            ) : <ForecastChart actual={actual} forecast={forecast} height={240} />}
          </div>
          <div className="grid grid-cols-1 gap-4">
            {modelStatsQ.isError ? <ErrorNotice error={modelStatsQ.error} onRetry={() => void modelStatsQ.refetch()} /> : (
              <>
                <div className="rounded-sm bg-bg-surface-2 px-4 py-3 shadow-(--inset-hairline)">
                  <span className="text-caption text-text-muted">WAPE</span>
                  <div className="mt-1 text-h3 tabular-nums">{modelStatsQ.isLoading ? "…" : (modelStatsQ.data?.wape ?? 0).toFixed(1)}<span className="text-h4 text-text-secondary"> %</span></div>
                </div>
                <div className="rounded-sm bg-bg-surface-2 px-4 py-3 shadow-(--inset-hairline)">
                  <span className="text-caption text-text-muted">Оценка качества</span>
                  <div className="mt-1 text-h3 tabular-nums">{modelStatsQ.isLoading ? "…" : (modelStatsQ.data?.wapeScore ?? 0).toFixed(2)}</div>
                </div>
              </>
            )}
          </div>
        </div>
      </Panel>

      <Panel title="История качества" action={<Badge tone="info">версии модели</Badge>}>
        {modelStatsQ.isError ? <ErrorNotice error={modelStatsQ.error} onRetry={() => void modelStatsQ.refetch()} /> : modelStatsQ.isLoading ? <LoadingNotice /> : (
          <Timeline items={(modelStatsQ.data?.history ?? []).slice(-5).reverse().map((h) => ({
            date: h.date ?? "",
            title: `WAPE ${h.wape?.toFixed(1) ?? "—"} %`,
            note: `оценка ${h.wapeScore?.toFixed(2) ?? "—"}`,
          }))} />
        )}
      </Panel>
    </div>
  );
}
