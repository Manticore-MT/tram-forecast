import React from "react";
import { Icon, Badge, Stat, LoadMeter, Switch, Card, Select, Timeline } from "../../components";
import { seedSeries, ForecastChart, Sparkline, Heatmap, RouteStrip } from "./Charts";
import { Panel, LoadLegend, ErrorNotice, LoadingNotice } from "./Shell";
import { DemandMap, DATASET_ROUTE_NUMBERS, useMapStops } from "./MapScreens";
import { useAttention, useLoadMatrix, useModelStats, useRouteForecast, useRoutes } from "../../api/hooks";
import type { CommonParams } from "../../api/hooks";

export interface OverviewProps {
  horizon: CommonParams["horizon"];
  route: string;
  date: string;
}

const MONTHS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

const EXTERNAL_FACTORS: [string, string, "ok" | "warn" | "info", string][] = [
  ["Календарь", "calendar", "info", "Праздничные дни — трафик выше на 14 %"],
  ["Погода", "cloud-rain", "warn", "Осадки завтра — +6 % на маршрутах А, 7"],
  ["События города", "party-popper", "info", "Матч на стадионе — пик 19:00–21:00"],
  ["ВСМ", "train-front", "ok", "Влияние на пересадочные узлы — низкое"],
];

const PERIOD_OPTIONS = [
  { value: "month-1", label: "Август 2026" },
  { value: "month-2", label: "Сентябрь 2026" },
  { value: "week-1", label: "Неделя 36" },
  { value: "week-2", label: "Неделя 37" },
];

export function Overview({ horizon, route, date }: OverviewProps) {
  const [band, setBand] = React.useState(true);
  const [periodA, setPeriodA] = React.useState("month-1");
  const [periodB, setPeriodB] = React.useState("month-2");
  const params: CommonParams = { horizon, date };

  const routeForecastQ = useRouteForecast(route, params);
  const networkQ = useRoutes(params);
  const attentionQ = useAttention(params);
  const modelStatsQ = useModelStats();
  const yearForecastQ = useRouteForecast(route, { horizon: "year", date });
  const { stops: mapStops } = useMapStops(route, 18, date);

  const points = routeForecastQ.data?.points ?? [];
  const splitIdx = points.findIndex((p) => p.actual === undefined);
  const cutoff = Math.max(2, Math.min(points.length - 2, splitIdx === -1 ? points.length - 2 : splitIdx));
  const actual = points.length >= 4 ? points.slice(0, cutoff).map((p) => p.actual ?? p.baseline ?? 0) : seedSeries(11, 60, 120, 480);
  const forecast = points.length >= 4 ? points.slice(cutoff).map((p) => p.forecast ?? p.baseline ?? 0) : seedSeries(29, 40, 130, 520);
  const conf = forecast.map((_, i) => 0.04 + (i / forecast.length) * 0.16);

  const networkRoutes = networkQ.data?.routes ?? [];
  const maxNetworkForecast = Math.max(1, ...networkRoutes.map((r) => Math.max(0, ...(r.points ?? []).map((p) => p.forecast ?? 0))));
  const routes: [string, number][] = networkRoutes.map((r) => {
    const last = r.points?.[r.points.length - 1];
    return [r.routeId ?? "?", Math.max(0, Math.min(1, (last?.forecast ?? 0) / maxNetworkForecast))];
  });

  const yearPoints = yearForecastQ.data?.points ?? [];
  const longTerm = yearPoints.length > 0 ? yearPoints.map((p) => p.forecast ?? p.baseline ?? 0) : seedSeries(41, 12, 15000, 6000).map((v, i) => v * (1 + i * 0.015));
  const maxLongTerm = Math.max(1, ...longTerm);

  const peakPoint = points.reduce((best, p) => ((p.forecast ?? 0) > (best?.forecast ?? -Infinity) ? p : best), points[0]);
  const totalNowForecast = networkRoutes.reduce((sum, r) => {
    const last = r.points?.[r.points.length - 1];
    return sum + (last?.forecast ?? 0);
  }, 0);

  const STOPS = mapStops.filter((_, i) => i % 4 === 0).slice(0, 7).map((s) => ({ name: s.name, load: s.v }));

  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--space-5)" }}>
        <Card tone="surface">{networkQ.isError ? <ErrorNotice error={networkQ.error} /> : <Stat label="Пассажиров в час" value={networkQ.isLoading ? "…" : Math.round(totalNowForecast).toLocaleString("ru-RU")} caption="сумма прогноза по сети, последний период" />}</Card>
        <Card tone="surface">{routeForecastQ.isError ? <ErrorNotice error={routeForecastQ.error} /> : <Stat label="Пиковый прогноз" value={routeForecastQ.isLoading ? "…" : Math.round(peakPoint?.forecast ?? 0).toLocaleString("ru-RU")} unit="пасс" caption={peakPoint ? `маршрут ${route} · ${new Date(peakPoint.periodStart!).toLocaleString("ru-RU", { hour: "2-digit", minute: "2-digit" })}` : undefined} />}</Card>
        <Card tone="surface">{modelStatsQ.isError ? <ErrorNotice error={modelStatsQ.error} /> : <Stat label="WAPE модели" value={modelStatsQ.isLoading ? "…" : (modelStatsQ.data?.wape ?? 0).toFixed(1)} unit="%" caption="за 30 дней" />}</Card>
        <Card tone="surface"><Stat label="Маршрутов в модели" value={String(DATASET_ROUTE_NUMBERS.length)} caption="реальный датасет хакатона" /></Card>
      </div>

      <Panel title={`Прогноз загрузки · маршрут ${route} · горизонт ${horizon === "day" ? "1 день" : horizon === "month" ? "1 месяц" : "1 год"}`}
        action={<div style={{ display: "flex", alignItems: "center", gap: "var(--space-5)" }}>
          <Switch checked={band} onChange={() => setBand(!band)} label="Доверительный интервал" />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "var(--type-caption)", color: "var(--text-muted)" }}><span style={{ width: 14, height: 2, background: "var(--cyan-500)" }} />факт</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "var(--type-caption)", color: "var(--text-muted)" }}><span style={{ width: 14, height: 2, background: "var(--brand-accent)" }} />прогноз</span>
        </div>}>
        {routeForecastQ.isError ? <ErrorNotice error={routeForecastQ.error} /> : routeForecastQ.isLoading ? <LoadingNotice /> : <ForecastChart actual={actual} forecast={forecast} band={band ? conf : null} height={280} />}
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "var(--space-5)" }}>
        <Panel title="Загрузка по остановкам" action={<LoadLegend />}>
          {routeForecastQ.isError ? <ErrorNotice error={routeForecastQ.error} /> : <RouteStrip stops={STOPS} active={3} />}
        </Panel>
        <Panel title="Маршруты сети" action={<Badge tone="info">по прогнозу</Badge>}>
          {networkQ.isError ? <ErrorNotice error={networkQ.error} /> : networkQ.isLoading ? <LoadingNotice /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {routes.map(([r, v]) => (
                <div key={r} style={{ display: "grid", gridTemplateColumns: "56px 1fr", gap: "var(--space-4)", alignItems: "center" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "var(--type-ui-s)" }}><Icon name="tram-front" size={14} />{r}</span>
                  <LoadMeter value={v} />
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "var(--space-5)" }}>
        <Panel title="Долгосрочный прогноз · 12 месяцев" action={<Badge tone="info">горизонт: год</Badge>}>
          {yearForecastQ.isError ? <ErrorNotice error={yearForecastQ.error} /> : yearForecastQ.isLoading ? <LoadingNotice /> : (
            <>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-2)" }}>
                {longTerm.map((v, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <span style={{ width: "100%", borderRadius: "2px 2px 0 0", background: i === longTerm.length - 1 ? "var(--brand-accent)" : "var(--cyan-500)", opacity: i === longTerm.length - 1 ? 1 : 0.55, height: `${Math.round((v / maxLongTerm) * 100)}px` }} />
                    <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>{MONTHS[i] ?? i + 1}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "var(--space-4)", display: "flex", gap: "var(--space-6)" }}>
                <Stat label="Прогноз, последний месяц" value={Math.round(longTerm[longTerm.length - 1]).toLocaleString("ru-RU")} unit="пасс/ч" />
              </div>
            </>
          )}
        </Panel>
        <Panel title="Карта прогнозируемого спроса" action={<LoadLegend />}>
          <DemandMap route={route} date={date} height={220} />
        </Panel>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
        <Panel title="Зоны внимания" action={<Badge tone="danger">{attentionQ.data?.zones?.length ?? 0} зоны</Badge>}>
          {attentionQ.isError ? <ErrorNotice error={attentionQ.error} /> : attentionQ.isLoading ? <LoadingNotice /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {(attentionQ.data?.zones ?? []).slice(0, 5).map((z, i) => (
                <div key={`${z.routeId}-${z.stopId}-${i}`} style={{ display: "grid", gridTemplateColumns: "1fr 96px", gap: "var(--space-4)", alignItems: "center", padding: "var(--space-4)", background: "var(--bg-surface-2)", borderRadius: "var(--radius-md)", boxShadow: "var(--inset-hairline)" }}>
                  <div>
                    <div style={{ font: "var(--type-ui-s)", color: "var(--text-primary)" }}>маршрут {z.routeId}</div>
                    <div style={{ marginTop: 2, font: "var(--type-caption)", color: "var(--text-muted)" }}>остановка {z.stopId} · пик {z.peakAt ? new Date(z.peakAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) : "—"}</div>
                  </div>
                  <Badge tone={z.level === "CRITICAL" ? "danger" : z.level === "WARNING" ? "warn" : "info"}>{Math.round(z.deviationPct ?? 0)} % откл.</Badge>
                </div>
              ))}
              {(attentionQ.data?.zones ?? []).length === 0 && <span style={{ font: "var(--type-body-s)", color: "var(--text-muted)" }}>Нет зон с заметным отклонением</span>}
            </div>
          )}
        </Panel>
        <Panel title="Отклонение от базового уровня" action={<Badge tone="info">последний период</Badge>}>
          {networkQ.isError ? <ErrorNotice error={networkQ.error} /> : networkQ.isLoading ? <LoadingNotice /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {networkRoutes.map((r) => {
                const last = r.points?.[r.points.length - 1];
                const d = last?.baseline ? Math.round(((last.forecast! - last.baseline) / last.baseline) * 100) : 0;
                return (
                  <div key={r.routeId} style={{ display: "grid", gridTemplateColumns: "56px 1fr 64px", gap: "var(--space-4)", alignItems: "center" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "var(--type-ui-s)" }}><Icon name="tram-front" size={14} />{r.routeId}</span>
                    <span style={{ position: "relative", height: 8, borderRadius: 2, background: "var(--ink-600)", overflow: "hidden" }}>
                      <span style={{ position: "absolute", top: 0, bottom: 0, left: d > 0 ? "50%" : `${50 - Math.min(50, Math.abs(d))}%`, width: `${Math.min(50, Math.abs(d))}%`, background: d > 0 ? "var(--status-warn)" : "var(--status-ok)" }} />
                    </span>
                    <span style={{ font: "var(--type-mono-s)", color: d > 0 ? "var(--status-warn)" : "var(--status-ok)", textAlign: "right" }}>{d > 0 ? "+" : ""}{d} %</span>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </div>

      <Panel title="Сравнение периодов" action={<Badge tone="neutral">пассажиропоток</Badge>}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "var(--space-5)", alignItems: "end" }}>
          <Select label="Период A" value={periodA} onChange={(e) => setPeriodA(e.target.value)} options={PERIOD_OPTIONS} />
          <Select label="Период B" value={periodB} onChange={(e) => setPeriodB(e.target.value)} options={PERIOD_OPTIONS} />
          <Stat label="Разница" value="9.4" unit="%" trend={{ dir: "up", value: "9.4 %" }}
            caption={`${PERIOD_OPTIONS.find((p) => p.value === periodA)?.label} → ${PERIOD_OPTIONS.find((p) => p.value === periodB)?.label}`} />
        </div>
      </Panel>

      <Panel title="Учёт внешних факторов" action={<Badge tone="info">в модели прогноза</Badge>}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--space-4)" }}>
          {EXTERNAL_FACTORS.map(([name, icon, tone, note]) => (
            <div key={name} style={{ padding: "var(--space-4)", background: "var(--bg-surface-2)", borderRadius: "var(--radius-md)", boxShadow: "var(--inset-hairline)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "var(--type-ui-s)" }}><Icon name={icon} size={16} />{name}</span>
                <Badge tone={tone} dot />
              </div>
              <span style={{ font: "var(--type-caption)", color: "var(--text-secondary)" }}>{note}</span>
            </div>
          ))}
        </div>
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
        <Panel title="Качество прогноза">
          {modelStatsQ.isError ? <ErrorNotice error={modelStatsQ.error} /> : modelStatsQ.isLoading ? <LoadingNotice /> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "var(--space-5)" }}>
              <Stat label="WAPE" value={(modelStatsQ.data?.wape ?? 0).toFixed(1)} unit="%" />
              <Stat label="Оценка качества" value={(modelStatsQ.data?.wapeScore ?? 0).toFixed(2)} />
            </div>
          )}
        </Panel>
        <Panel title="История качества прогнозирования">
          {modelStatsQ.isError ? <ErrorNotice error={modelStatsQ.error} /> : modelStatsQ.isLoading ? <LoadingNotice /> : (
            <Timeline items={(modelStatsQ.data?.history ?? []).slice(-5).reverse().map((h) => ({
              date: h.date ?? "",
              title: `WAPE ${h.wape?.toFixed(1) ?? "—"} %`,
              note: `оценка ${h.wapeScore?.toFixed(2) ?? "—"}`,
            }))} />
          )}
        </Panel>
      </div>
    </div>
  );
}

export interface RouteViewProps {
  route: string;
}

const DOW_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function RouteView({ route }: RouteViewProps) {
  const loadMatrixQ = useLoadMatrix(route);
  const cells = loadMatrixQ.data?.cells ?? [];
  const maxValue = Math.max(1, ...cells.map((c) => c.value ?? 0));
  const rows = DOW_LABELS.map((label, dow) => ({
    label,
    // Backend's dayOfWeek is assumed ISO (1 = Monday); DOW_LABELS index 0 = Monday too.
    values: Array.from({ length: 24 }, (_, hour) => {
      const cell = cells.find((c) => c.dayOfWeek === dow + 1 && c.hour === hour);
      return cell ? Math.max(0, Math.min(1, (cell.value ?? 0) / maxValue)) : 0;
    }),
  }));
  const criticalStops = cells.filter((c) => (c.value ?? 0) / maxValue > 0.8).length;
  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
        <Card tone="surface"><Stat label="Маршрут" value={route} caption="матрица загрузки ниже" /></Card>
        <Card tone="surface"><Stat label="Часов с загрузкой > 80 %" value={String(criticalStops)} caption="за типичную неделю" /></Card>
      </div>
      <Panel title={`Матрица загрузки · маршрут ${route} · день × час`} action={<LoadLegend />}>
        {loadMatrixQ.isError ? <ErrorNotice error={loadMatrixQ.error} /> : loadMatrixQ.isLoading ? <LoadingNotice /> : <Heatmap rows={rows} />}
      </Panel>
    </div>
  );
}

export function ModelView() {
  const modelStatsQ = useModelStats(90);
  const history = modelStatsQ.data?.history ?? [];
  const wapeSeries = history.map((h) => h.wape ?? 0);
  const scoreSeries = history.map((h) => h.wapeScore ?? 0);
  if (modelStatsQ.isError) {
    return <ErrorNotice error={modelStatsQ.error} />;
  }
  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "var(--space-5)" }}>
        <Card tone="surface">
          <Stat label="WAPE" value={modelStatsQ.isLoading ? "…" : (modelStatsQ.data?.wape ?? 0).toFixed(1)} unit="%" caption="взвешенная ошибка по суточным прогнозам" />
          {wapeSeries.length > 1 && <Sparkline data={wapeSeries} />}
        </Card>
        <Card tone="surface">
          <Stat label="Оценка качества" value={modelStatsQ.isLoading ? "…" : (modelStatsQ.data?.wapeScore ?? 0).toFixed(2)} caption="за 90 дней" />
          {scoreSeries.length > 1 && <Sparkline data={scoreSeries} color="var(--brand-accent)" />}
        </Card>
      </div>
      <Panel title="История качества прогнозирования">
        {modelStatsQ.isLoading ? <LoadingNotice /> : (
          <Timeline items={history.slice().reverse().map((h) => ({
            date: h.date ?? "",
            title: `WAPE ${h.wape?.toFixed(1) ?? "—"} %`,
            note: `оценка ${h.wapeScore?.toFixed(2) ?? "—"}`,
          }))} />
        )}
      </Panel>
    </div>
  );
}
