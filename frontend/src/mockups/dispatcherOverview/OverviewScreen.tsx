import React from "react";
import { Badge, Timeline } from "../../components";
import { ForecastChart } from "../../products/forecast-dashboard/Charts";
import { Panel, ErrorNotice, LoadingNotice } from "../../products/forecast-dashboard/Shell";
import { DEFAULT_ROUTE } from "../../products/forecast-dashboard/MapScreens";
import { MapCanvas } from "../stopDetail/MapCanvas";
import { useAttention, useMeta, useModelStats, useRouteForecast, useRoutes } from "../../api/hooks";
import type { CommonParams } from "../../api/hooks";
import { MetricCard, DeviationList, PeriodCompare } from "./shared";
import { PERIOD_OPTIONS } from "./data";
import { zonesFromAttention, detailFromNetwork } from "./levelData";

/** Экран 2 — «Обзор». Обычная сетка карточек для стейкхолдера, без карты на весь экран.
 *  Данные — из реального API, как и на экране «Диспетчер» (см. DispatcherScreen.tsx). */
export function OverviewScreen() {
  const metaQ = useMeta();
  const date = metaQ.data?.today;
  const dayParams: CommonParams = { horizon: "day", date: date ?? "" };
  const yearParams: CommonParams = { horizon: "year", date: date ?? "" };

  const networkQ = useRoutes(dayParams);
  const yearNetworkQ = useRoutes(yearParams);
  const attentionQ = useAttention(dayParams);
  const modelStatsQ = useModelStats(30);
  const routeForecastQ = useRouteForecast(date ? DEFAULT_ROUTE : undefined, dayParams);

  if (!date) return <LoadingNotice />;

  const { detail: networkDetail } = detailFromNetwork(networkQ.data);
  const yearTotal = (yearNetworkQ.data?.routes ?? []).reduce((sum, r) => {
    const last = r.points?.[r.points.length - 1];
    return sum + (last?.forecast ?? 0);
  }, 0);
  const zones = zonesFromAttention(attentionQ.data?.zones ?? [], 5);

  const points = routeForecastQ.data?.points ?? [];
  const splitIdx = points.findIndex((p) => p.actual === undefined);
  const cutoff = Math.max(2, Math.min(points.length - 2, splitIdx === -1 ? points.length - 2 : splitIdx));
  const actual = points.slice(0, cutoff).map((p) => p.actual ?? p.baseline ?? 0);
  const forecast = points.slice(cutoff).map((p) => p.forecast ?? p.baseline ?? 0);

  return (
    <div className="grid gap-6">
      <Panel title="Прогноз по сети">
        <div className="grid grid-cols-2 gap-5">
          <div className="grid gap-5">
            <div className="grid grid-cols-2 gap-5">
              {networkQ.isError ? <ErrorNotice error={networkQ.error} /> : <MetricCard label="Прогноз, последний час" value={networkQ.isLoading ? "…" : networkDetail.forecastValue} unit="чел/ч" caption="по сети" />}
              {yearNetworkQ.isError ? <ErrorNotice error={yearNetworkQ.error} /> : <MetricCard label="Долгосрочный прогноз" value={yearNetworkQ.isLoading ? "…" : Math.round(yearTotal).toLocaleString("ru-RU")} unit="чел/ч" caption="на конец года" />}
            </div>
          </div>
          <MapCanvas level="all" caption="Карта спроса · вся сеть" activeIndex={-1} style={{ minHeight: 260 }} />
        </div>
      </Panel>

      <Panel title="Проблемные места">
        {attentionQ.isError ? <ErrorNotice error={attentionQ.error} /> : attentionQ.isLoading ? <LoadingNotice /> : <DeviationList title="Рейтинг зон внимания" items={zones} layout="table" />}
      </Panel>

      <Panel title="Сравнение периодов" action={<Badge tone="neutral">пассажиропоток</Badge>}>
        <PeriodCompare options={PERIOD_OPTIONS} />
      </Panel>

      <Panel title="Качество прогноза">
        <div className="grid grid-cols-[1.6fr_1fr] gap-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-5">
              <span className="inline-flex items-center gap-1.5 text-caption text-text-muted"><span className="w-3.5 h-0.5 bg-cyan-500" />факт</span>
              <span className="inline-flex items-center gap-1.5 text-caption text-text-muted"><span className="w-3.5 h-0.5 bg-brand" />прогноз</span>
            </div>
            {routeForecastQ.isError ? <ErrorNotice error={routeForecastQ.error} /> : routeForecastQ.isLoading ? <LoadingNotice /> : <ForecastChart actual={actual} forecast={forecast} height={240} />}
          </div>
          <div className="grid grid-cols-1 gap-4">
            {modelStatsQ.isError ? <ErrorNotice error={modelStatsQ.error} /> : (
              <>
                <div className="py-3 px-4 bg-bg-surface-2 rounded-sm shadow-(--inset-hairline)">
                  <span className="text-caption text-text-muted">WAPE</span>
                  <div className="mt-1 text-h3 tabular-nums">{modelStatsQ.isLoading ? "…" : (modelStatsQ.data?.wape ?? 0).toFixed(1)}<span className="text-h4 text-text-secondary"> %</span></div>
                </div>
                <div className="py-3 px-4 bg-bg-surface-2 rounded-sm shadow-(--inset-hairline)">
                  <span className="text-caption text-text-muted">Оценка качества</span>
                  <div className="mt-1 text-h3 tabular-nums">{modelStatsQ.isLoading ? "…" : (modelStatsQ.data?.wapeScore ?? 0).toFixed(2)}</div>
                </div>
              </>
            )}
          </div>
        </div>
      </Panel>

      <Panel title="История качества" action={<Badge tone="info">версии модели</Badge>}>
        {modelStatsQ.isError ? <ErrorNotice error={modelStatsQ.error} /> : modelStatsQ.isLoading ? <LoadingNotice /> : (
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
