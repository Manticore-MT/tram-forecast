import React from "react";
import { Badge } from "../../components";
import { useAttention, useMeta, useModelStats, useRoutes } from "../../api/hooks";
import { ErrorNotice, LoadingNotice } from "../../shared/notices";
import { useDispatcher } from "./store";
import { useForecastParams, useInitClock, useScenarioActive } from "./forecast";
import { StripHeader } from "./panels/timeStrip/StripHeader";
import { AttentionCard, CompareCard, QualityCard, TotalCard } from "./overview/KpiCards";
import { AttentionRatingPanel, DemandMapPanel, DynamicsPanel, TopRoutesPanel } from "./overview/NetworkPanels";
import { QualityHistory } from "./overview/QualityHistory";
import { RouteSection } from "./overview/RouteSection";
import { comparisonCursor, comparisonLabel, updatedAt, type CompareMode } from "./overview/network";

/** Экран «Обзор» для руководителя: сколько → как меняется → где → можно ли доверять.
 *  Время и сценарий общие с диспетчером (store.ts). */
export function OverviewScreen() {
  const ready = useInitClock();
  const meta = useMeta();
  const scale = useDispatcher((s) => s.scale);
  const cursor = useDispatcher((s) => s.cursor);
  const scenario = useScenarioActive();
  const params = useForecastParams();
  const [mode, setMode] = React.useState<CompareMode>("period");

  const compareParams = params && cursor ? { ...params, date: comparisonCursor(scale, cursor, mode) } : undefined;
  const network = useRoutes(params);
  const comparison = useRoutes(compareParams);
  const attention = useAttention(params);
  const stats = useModelStats(30);

  if (!ready || !cursor) {
    return (
      <div className="grid min-h-100 place-items-center">
        {meta.isError ? <ErrorNotice error={meta.error} onRetry={() => void meta.refetch()} /> : <LoadingNotice />}
      </div>
    );
  }

  const compareLabel = comparisonLabel(scale, cursor, mode);
  const updated = updatedAt(network.data?.lastUpdated);
  const routeIds = network.data ? (network.data.routes ?? []).flatMap((r) => (r.routeId ? [r.routeId] : [])) : undefined;

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="min-w-0 flex-1">
          <StripHeader rangeLabel={null} />
        </div>
        {updated && <span className="text-caption text-text-muted">Обновлено в {updated}</span>}
        {scenario && <Badge tone="accent">Сценарий изменён</Badge>}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <TotalCard network={network} scale={scale} />
        <CompareCard network={network} comparison={comparison} scale={scale} mode={mode} onMode={setMode} comparisonLabel={compareLabel} />
        <AttentionCard attention={attention} />
        <QualityCard stats={stats} />

        <div className="grid md:col-span-2 xl:col-span-3">
          <DynamicsPanel network={network} comparison={comparison} scale={scale} comparisonLabel={compareLabel} />
        </div>
        <div className="grid md:col-span-2 xl:col-span-1">
          <DemandMapPanel network={network} />
        </div>

        <div className="grid xl:col-span-2">
          <TopRoutesPanel network={network} />
        </div>
        <div className="grid xl:col-span-2">
          <AttentionRatingPanel attention={attention} scale={scale} />
        </div>

        <div className="grid md:col-span-2 xl:col-span-4">
          <RouteSection routeIds={routeIds} params={params} scale={scale} cursor={cursor} />
        </div>
        <div className="grid md:col-span-2 xl:col-span-4">
          <QualityHistory stats={stats} />
        </div>
      </div>
    </div>
  );
}
