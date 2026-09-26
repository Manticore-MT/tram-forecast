import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, Select, Stat } from "../../../components";
import type { useAttention, useModelStats, useRoutes } from "../../../api/hooks";
import { SCALE_UNITS, pointLabel, type Scale } from "../time";
import { deviationPct, fmtInt, fmtPct, fmtSigned, toneForPct } from "../format";
import { compareOptions, effectiveMode, networkPoints, peakIndex, sumForecast, type CompareMode } from "./network";
import { Empty, QueryGate, TONE_TEXT } from "./QueryGate";

type RoutesQuery = ReturnType<typeof useRoutes>;

function KpiCard({ children }: { children: ReactNode }) {
  return (
    <Card tone="surface" padding="var(--space-5)" className="flex min-w-0 flex-col gap-3">
      {children}
    </Card>
  );
}

export function TotalCard({ network, scale }: { network: RoutesQuery; scale: Scale }) {
  return (
    <KpiCard>
      <QueryGate q={network}>
        {() => {
          const points = networkPoints(network.data?.routes ?? []);
          if (points.length === 0) return <Empty>Нет прогноза по маршрутам за этот период</Empty>;
          const total = sumForecast(points);
          const dev = deviationPct(total, points.reduce((sum, p) => sum + p.baseline, 0));
          const peak = points[peakIndex(points)];
          return (
            <Stat
              label="Пассажиропоток за период"
              value={fmtInt(total)}
              unit="пасс"
              caption={
                <span>
                  <span className={TONE_TEXT[toneForPct(dev)]}>{fmtPct(dev)}</span> к базе · пик {pointLabel(scale, peak.periodStart)},{" "}
                  {fmtInt(peak.forecast)} {SCALE_UNITS[scale]}
                </span>
              }
            />
          );
        }}
      </QueryGate>
    </KpiCard>
  );
}

export interface CompareCardProps {
  network: RoutesQuery;
  comparison: RoutesQuery;
  scale: Scale;
  mode: CompareMode;
  onMode: (mode: CompareMode) => void;
  comparisonLabel: string;
}

export function CompareCard({ network, comparison, scale, mode, onMode, comparisonLabel }: CompareCardProps) {
  const options = compareOptions(scale);
  return (
    <KpiCard>
      <Select
        value={effectiveMode(scale, mode)}
        options={options}
        disabled={options.length < 2}
        onChange={(e) => onMode(e.target.value as CompareMode)}
      />
      <QueryGate q={network}>
        {() => (
          <QueryGate q={comparison}>
            {() => {
              const now = sumForecast(networkPoints(network.data?.routes ?? []));
              const before = sumForecast(networkPoints(comparison.data?.routes ?? []));
              if (!before) return <Empty>Нет прогноза за {comparisonLabel}</Empty>;
              const pct = deviationPct(now, before);
              return (
                <Stat
                  value={fmtPct(pct)}
                  caption={
                    <span>
                      {fmtSigned(now - before)} пасс · {comparisonLabel}
                      <br />
                      прогноз к прогнозу
                    </span>
                  }
                />
              );
            }}
          </QueryGate>
        )}
      </QueryGate>
    </KpiCard>
  );
}

export function AttentionCard({ attention }: { attention: ReturnType<typeof useAttention> }) {
  return (
    <KpiCard>
      <QueryGate q={attention}>
        {() => {
          const zones = attention.data?.zones ?? [];
          const critical = zones.filter((z) => z.level === "CRITICAL").length;
          const warning = zones.filter((z) => z.level === "WARNING").length;
          return (
            <Stat
              label="Зоны внимания"
              value={fmtInt(zones.length)}
              tone={critical > 0 ? "danger" : warning > 0 ? "warn" : undefined}
              caption={
                zones.length === 0 ? "заметных отклонений нет" : (
                  <span>
                    <span className={cn(critical > 0 && TONE_TEXT.danger)}>{critical} крит.</span> ·{" "}
                    <span className={cn(warning > 0 && TONE_TEXT.warn)}>{warning} вним.</span>
                  </span>
                )
              }
            />
          );
        }}
      </QueryGate>
    </KpiCard>
  );
}

export function QualityCard({ stats }: { stats: ReturnType<typeof useModelStats> }) {
  return (
    <KpiCard>
      <QueryGate q={stats}>
        {() => (
          <Stat
            label="Качество прогноза"
            value={(stats.data?.wapeScore ?? 0).toFixed(2)}
            unit="WAPE-score"
            caption={`WAPE ${(stats.data?.wape ?? 0).toFixed(1)} % · за 30 дней · от 0 до 1, выше — точнее`}
          />
        )}
      </QueryGate>
    </KpiCard>
  );
}
