import React from "react";
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
    <div style={{ display: "grid", gap: "var(--space-6)" }}>
      <Panel title="Прогноз по сети">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
          <div style={{ display: "grid", gap: "var(--space-5)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "var(--space-5)" }}>
          <DeviationList title="Рейтинг зон внимания" items={zones} />
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <div className="mt-eyebrow">Детализация по маршрутам/остановкам</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {ROUTE_BREAKDOWN.map(([name, dev, time]) => (
                <div key={name} style={{ display: "grid", gridTemplateColumns: "1fr 80px 70px", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) var(--space-4)", background: "var(--bg-surface-2)", borderRadius: "var(--radius-sm)", boxShadow: "var(--inset-hairline)" }}>
                  <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{name}</span>
                  <span style={{ font: "var(--type-mono-s)", color: dev.startsWith("+") ? "var(--status-warn)" : "var(--status-ok)", textAlign: "right" }}>{dev}</span>
                  <span style={{ font: "var(--type-mono-s)", color: "var(--text-muted)", textAlign: "right" }}>{time}</span>
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
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "var(--space-5)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-5)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "var(--type-caption)", color: "var(--text-muted)" }}><span style={{ width: 14, height: 2, background: "var(--cyan-500)" }} />факт</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "var(--type-caption)", color: "var(--text-muted)" }}><span style={{ width: 14, height: 2, background: "var(--accent)" }} />прогноз</span>
            </div>
            <ForecastChart actual={actual} forecast={forecast} height={240} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-4)" }}>
            {QUALITY_METRICS.map(([label, value, unit]) => (
              <div key={label} style={{ padding: "var(--space-3) var(--space-4)", background: "var(--bg-surface-2)", borderRadius: "var(--radius-sm)", boxShadow: "var(--inset-hairline)" }}>
                <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>{label}</span>
                <div style={{ marginTop: 4, font: "var(--type-h3)", fontVariantNumeric: "tabular-nums" }}>{value}{unit && <span style={{ font: "var(--type-h4)", color: "var(--text-secondary)" }}> {unit}</span>}</div>
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
