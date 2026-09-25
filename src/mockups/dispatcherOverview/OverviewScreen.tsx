import React from "react";
import { cn } from "@/lib/utils";
import { Badge, Timeline } from "../../components";
import { seedSeries, ForecastChart } from "../../products/forecast-dashboard/Charts";
import { Panel } from "../../products/forecast-dashboard/Shell";
import { MapCanvas } from "../stopDetail/MapCanvas";
import { MetricCard, DeviationList, FactorsCard, PeriodCompare } from "./shared";
import { PEAKS, NETWORK_FACTORS, QUALITY_METRICS, ROUTE_BREAKDOWN, PERIOD_OPTIONS, QUALITY_HISTORY } from "./data";
import { networkZones } from "./levelData";

/** Экран 2 — «Обзор». Обычная сетка карточек для стейкхолдера, без карты на весь экран. */
export function OverviewScreen() {
  const actual = React.useMemo(() => seedSeries(11, 60, 120, 480), []);
  const forecast = React.useMemo(() => seedSeries(29, 40, 130, 520), []);
  const zones = React.useMemo(() => networkZones(), []);

  return (
    <div className="grid gap-6">
      <Panel title="Прогноз по сети">
        <div className="grid grid-cols-2 gap-5">
          <div className="grid gap-5">
            <div className="grid grid-cols-2 gap-5">
              <MetricCard label="Прогноз за период" value="18 420" unit="чел/ч" trend={{ dir: "up", value: "6.2 %" }} caption="к прошлой неделе" />
              <MetricCard label="Долгосрочный прогноз" value="21 300" unit="чел/ч" caption="на конец года" />
            </div>
            <DeviationList title="Прогнозируемые пики" items={PEAKS} layout="table" />
            <FactorsCard factors={NETWORK_FACTORS} />
          </div>
          <MapCanvas level="all" caption="Карта спроса · вся сеть" activeIndex={-1} style={{ minHeight: 260 }} />
        </div>
      </Panel>

      <Panel title="Проблемные места">
        <div className="grid grid-cols-[1.2fr_1fr] gap-5">
          <DeviationList title="Рейтинг зон внимания" items={zones} />
          <div className="flex flex-col gap-2">
            <div className="mt-eyebrow">Детализация по маршрутам/остановкам</div>
            <div className="flex flex-col gap-2">
              {ROUTE_BREAKDOWN.map(([name, dev, time]) => (
                <div key={name} className="grid grid-cols-[1fr_80px_70px] items-center gap-3 py-3 px-4 bg-bg-surface-2 rounded-sm shadow-(--inset-hairline)">
                  <span className="text-body-s text-text-secondary">{name}</span>
                  <span className={cn("text-mono-s text-right", dev.startsWith("+") ? "text-status-warn" : "text-status-ok")}>{dev}</span>
                  <span className="text-mono-s text-text-muted text-right">{time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
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
            <ForecastChart actual={actual} forecast={forecast} height={240} />
          </div>
          <div className="grid grid-cols-1 gap-4">
            {QUALITY_METRICS.map(([label, value, unit]) => (
              <div key={label} className="py-3 px-4 bg-bg-surface-2 rounded-sm shadow-(--inset-hairline)">
                <span className="text-caption text-text-muted">{label}</span>
                <div className="mt-1 text-h3 tabular-nums">{value}{unit && <span className="text-h4 text-text-secondary"> {unit}</span>}</div>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <Panel title="История качества" action={<Badge tone="info">версии модели</Badge>}>
        <Timeline items={QUALITY_HISTORY} />
      </Panel>
    </div>
  );
}
