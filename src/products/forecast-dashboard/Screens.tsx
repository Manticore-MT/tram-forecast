import React from "react";
import { Button, Icon, Badge, Stat, LoadMeter, Switch, Card } from "../../components";
import { seedSeries, ForecastChart, Sparkline, Heatmap, RouteStrip, Stop } from "./Charts";
import { Panel, LoadLegend } from "./Shell";

export const STOPS: Stop[] = [
  { name: "Метро Сокольники", load: 0.34 }, { name: "Стромынка", load: 0.52 }, { name: "Матросская Тишина", load: 0.61 },
  { name: "Электрозаводская", load: 0.86 }, { name: "Площадь Журавлёва", load: 0.74 }, { name: "Госпитальный Вал", load: 0.48 },
  { name: "Лефортово", load: 0.29 },
];

export interface OverviewProps {
  horizon: string;
  route: string;
}

export function Overview({ horizon, route }: OverviewProps) {
  const [band, setBand] = React.useState(true);
  const actual = seedSeries(11, 60, 120, 480);
  const forecast = seedSeries(29, 40, 130, 520);
  const conf = forecast.map((_, i) => 0.04 + (i / forecast.length) * 0.16);
  const routes: [string, number][] = [["3", 0.58], ["17", 0.86], ["27", 0.41], ["А", 0.72], ["10", 0.33], ["7", 0.65]];
  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--space-5)" }}>
        <Card tone="surface"><Stat label="Пассажиров в час" value="18 420" trend={{ dir: "up", value: "6.2 %" }} caption="к прошлой неделе" /></Card>
        <Card tone="surface"><Stat label="Пиковая загрузка" value="86" unit="%" caption="Электрозаводская · 18:40" /></Card>
        <Card tone="surface"><Stat label="MAPE модели" value="7.4" unit="%" trend={{ dir: "down", value: "1.8 п.п." }} caption="за 30 дней" /></Card>
        <Card tone="surface"><Stat label="Маршрутов в модели" value="168" caption="валидации за 4 года" /></Card>
      </div>

      <Panel title={`Прогноз загрузки · маршрут ${route} · горизонт ${horizon === "day" ? "1 день" : horizon === "month" ? "1 месяц" : "1 год"}`}
        action={<div style={{ display: "flex", alignItems: "center", gap: "var(--space-5)" }}>
          <Switch checked={band} onChange={() => setBand(!band)} label="Доверительный интервал" />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "var(--type-caption)", color: "var(--text-muted)" }}><span style={{ width: 14, height: 2, background: "var(--cyan-500)" }} />факт</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "var(--type-caption)", color: "var(--text-muted)" }}><span style={{ width: 14, height: 2, background: "var(--accent)" }} />прогноз</span>
        </div>}>
        <ForecastChart actual={actual} forecast={forecast} band={band ? conf : null} height={280} />
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "var(--space-5)" }}>
        <Panel title="Загрузка по остановкам" action={<LoadLegend />}>
          <RouteStrip stops={STOPS} active={3} />
        </Panel>
        <Panel title="Маршруты сети" action={<Badge tone="info">по пиковой загрузке</Badge>}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {routes.map(([r, v]) => (
              <div key={r} style={{ display: "grid", gridTemplateColumns: "56px 1fr", gap: "var(--space-4)", alignItems: "center" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "var(--type-ui-s)" }}><Icon name="tram-front" size={14} />{r}</span>
                <LoadMeter value={v} />
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export interface RouteViewProps {
  route: string;
}

export function RouteView({ route }: RouteViewProps) {
  const rows = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d, i) => ({ label: d, values: seedSeries(7 + i, 24, 0.1, i > 4 ? 0.5 : 0.85).map((v) => Math.min(1, v)) }));
  const recs: [string, string, string][] = [
    ["danger", "Электрозаводская, 18:30–19:10", "Прогноз 86 % — добавить 2 вагона на выпуск"],
    ["warn", "Площадь Журавлёва, 08:10–08:50", "Прогноз 74 % — сократить интервал до 5 мин"],
    ["ok", "Лефортово, весь день", "Резерв: можно снять 1 вагон после 20:00"],
  ];
  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-5)" }}>
        <Card tone="surface"><Stat label="Интервал" value="6.5" unit="мин" caption="в час пик" /></Card>
        <Card tone="surface"><Stat label="Вагонов на линии" value="24" trend={{ dir: "up", value: "+3" }} caption="рекомендация модели" /></Card>
        <Card tone="surface"><Stat label="Критических остановок" value="2" caption="загрузка > 80 %" /></Card>
      </div>
      <Panel title={`Матрица загрузки · маршрут ${route} · день × час`} action={<LoadLegend />}>
        <Heatmap rows={rows} />
      </Panel>
      <Panel title="Рекомендации диспетчеру">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {recs.map(([tone, t, d]) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-4)", background: "var(--bg-surface-2)", borderRadius: "var(--radius-md)", boxShadow: "var(--inset-hairline)" }}>
              <Badge tone={tone as "danger" | "warn" | "ok"}>{tone === "danger" ? "Пик" : tone === "warn" ? "Внимание" : "Резерв"}</Badge>
              <span style={{ font: "var(--type-ui-s)", fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{t}</span>
              <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{d}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function ModelView() {
  const hist = seedSeries(3, 30, 6, 4);
  const metrics: [string, string, string][] = [["MAPE", "7.4", "%"], ["RMSE", "48.2", ""], ["R²", "0.91", ""], ["Обучение", "14", "мин"]];
  const features: [string, number][] = [["Час суток", 0.94], ["День недели", 0.71], ["Погода", 0.48], ["События в городе", 0.35], ["Интервал движения", 0.62]];
  const runs: [string, string, "ok" | "warn", string][] = [["v14", "13.09 04:00", "ok", "7.4 %"], ["v13", "06.09 04:00", "ok", "8.1 %"], ["v12", "30.08 04:00", "warn", "9.6 %"]];
  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--space-5)" }}>
        {metrics.map(([l, v, u]) => (
          <Card key={l} tone="surface"><Stat label={l} value={v} unit={u} /><Sparkline data={hist} /></Card>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
        <Panel title="Вклад признаков">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {features.map(([f, v]) => (
              <div key={f} style={{ display: "grid", gridTemplateColumns: "180px 1fr 48px", gap: "var(--space-4)", alignItems: "center" }}>
                <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{f}</span>
                <span style={{ height: 8, borderRadius: 2, background: "var(--ink-600)", overflow: "hidden" }}><span style={{ display: "block", width: `${v * 100}%`, height: "100%", background: "var(--cyan-500)" }} /></span>
                <span style={{ font: "var(--type-mono-s)", color: "var(--text-muted)", textAlign: "right" }}>{v.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Обучения" action={<Button size="sm" variant="secondary" iconLeft={<Icon name="refresh-cw" size={14} />}>Переобучить</Button>}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {runs.map(([v, d, tone, m]) => (
              <div key={v} style={{ display: "grid", gridTemplateColumns: "60px 1fr 90px 70px", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) var(--space-4)", background: "var(--bg-surface-2)", borderRadius: "var(--radius-sm)", boxShadow: "var(--inset-hairline)", font: "var(--type-mono-s)" }}>
                <span style={{ color: "var(--text-primary)" }}>{v}</span>
                <span style={{ color: "var(--text-muted)" }}>{d}</span>
                <Badge tone={tone}>{tone === "ok" ? "в проде" : "архив"}</Badge>
                <span style={{ textAlign: "right", color: "var(--text-secondary)" }}>{m}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
