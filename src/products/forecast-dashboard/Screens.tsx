import React from "react";
import { Button, Icon, Badge, Stat, LoadMeter, Switch, Card, Select, Timeline } from "../../components";
import { seedSeries, ForecastChart, Sparkline, Heatmap, RouteStrip, Stop } from "./Charts";
import { Panel, LoadLegend } from "./Shell";
import { TRAM_ROUTES, DEFAULT_ROUTE, DemandMap } from "./MapScreens";

export const STOPS: Stop[] = TRAM_ROUTES[DEFAULT_ROUTE].stops
  .filter((_, i) => i % 4 === 0)
  .slice(0, 7)
  .map((s) => ({ name: s.name, load: s.load }));

export interface OverviewProps {
  horizon: string;
  route: string;
}

const MONTHS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

const ATTENTION_ZONES: [string, string, number, string][] = [
  ["Электрозаводская", "маршрут 17", 92, "3 дня подряд · 18:00–19:30"],
  ["Семёновская", "маршрут 7", 87, "2 дня подряд · 08:00–09:00"],
  ["Бауманская", "маршрут А", 81, "разово · 18:40"],
];

const BASELINE_DEVIATION: [string, number][] = [["17", 12], ["27", -4], ["А", 18], ["7", -7], ["1", 3]];

const QUALITY_HISTORY = [
  { date: "13.09", title: "v14 · MAPE 7.4 %", note: "в проде", done: true },
  { date: "06.09", title: "v13 · MAPE 8.1 %", note: "архив" },
  { date: "30.08", title: "v12 · MAPE 9.6 %", note: "архив" },
];

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

export function Overview({ horizon, route }: OverviewProps) {
  const [band, setBand] = React.useState(true);
  const [periodA, setPeriodA] = React.useState("month-1");
  const [periodB, setPeriodB] = React.useState("month-2");
  const actual = seedSeries(11, 60, 120, 480);
  const forecast = seedSeries(29, 40, 130, 520);
  const conf = forecast.map((_, i) => 0.04 + (i / forecast.length) * 0.16);
  const routes: [string, number][] = [["1", 0.58], ["17", 0.86], ["27", 0.41], ["А", 0.72], ["11", 0.33], ["7", 0.65]];
  const longTerm = seedSeries(41, 12, 15000, 6000).map((v, i) => v * (1 + i * 0.015));
  const maxLongTerm = Math.max(...longTerm);
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

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "var(--space-5)" }}>
        <Panel title="Долгосрочный прогноз · 12 месяцев" action={<Badge tone="info">горизонт: год</Badge>}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-2)" }}>
            {longTerm.map((v, i) => (
              <div key={MONTHS[i]} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span style={{ width: "100%", borderRadius: "2px 2px 0 0", background: i === longTerm.length - 1 ? "var(--accent)" : "var(--cyan-500)", opacity: i === longTerm.length - 1 ? 1 : 0.55, height: `${Math.round((v / maxLongTerm) * 100)}px` }} />
                <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>{MONTHS[i]}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "var(--space-4)", display: "flex", gap: "var(--space-6)" }}>
            <Stat label="Прогноз к декабрю" value={Math.round(longTerm[longTerm.length - 1]).toLocaleString("ru-RU")} unit="пасс/ч" />
            <Stat label="Рост за год" value="18" unit="%" trend={{ dir: "up", value: "18 %" }} caption="к текущему уровню" />
          </div>
        </Panel>
        <Panel title="Карта прогнозируемого спроса" action={<LoadLegend />}>
          <DemandMap route={route} height={220} />
        </Panel>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
        <Panel title="Зоны внимания" action={<Badge tone="danger">{ATTENTION_ZONES.length} зоны</Badge>}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {ATTENTION_ZONES.map(([name, r, rating, note]) => (
              <div key={name} style={{ display: "grid", gridTemplateColumns: "1fr 96px", gap: "var(--space-4)", alignItems: "center", padding: "var(--space-4)", background: "var(--bg-surface-2)", borderRadius: "var(--radius-md)", boxShadow: "var(--inset-hairline)" }}>
                <div>
                  <div style={{ font: "var(--type-ui-s)", color: "var(--text-primary)" }}>{name}</div>
                  <div style={{ marginTop: 2, font: "var(--type-caption)", color: "var(--text-muted)" }}>{r} · {note}</div>
                </div>
                <Badge tone={rating >= 90 ? "danger" : rating >= 80 ? "warn" : "info"}>{rating} рейтинг</Badge>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Отклонение от базового уровня" action={<Badge tone="info">за 7 дней</Badge>}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {BASELINE_DEVIATION.map(([r, d]) => (
              <div key={r} style={{ display: "grid", gridTemplateColumns: "56px 1fr 64px", gap: "var(--space-4)", alignItems: "center" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "var(--type-ui-s)" }}><Icon name="tram-front" size={14} />{r}</span>
                <span style={{ position: "relative", height: 8, borderRadius: 2, background: "var(--ink-600)", overflow: "hidden" }}>
                  <span style={{ position: "absolute", top: 0, bottom: 0, left: d > 0 ? "50%" : `${50 - Math.min(50, Math.abs(d))}%`, width: `${Math.min(50, Math.abs(d))}%`, background: d > 0 ? "var(--status-warn)" : "var(--status-ok)" }} />
                </span>
                <span style={{ font: "var(--type-mono-s)", color: d > 0 ? "var(--status-warn)" : "var(--status-ok)", textAlign: "right" }}>{d > 0 ? "+" : ""}{d} %</span>
              </div>
            ))}
          </div>
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "var(--space-5)" }}>
            <Stat label="MAPE" value="7.4" unit="%" trend={{ dir: "down", value: "1.8 п.п." }} />
            <Stat label="RMSE" value="48.2" />
            <Stat label="R²" value="0.91" />
          </div>
        </Panel>
        <Panel title="История качества прогнозирования">
          <Timeline items={QUALITY_HISTORY} />
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
