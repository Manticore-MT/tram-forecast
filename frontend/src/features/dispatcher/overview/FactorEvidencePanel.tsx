import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input, Select } from "@/components";
import { Panel } from "@/shared/Panel.tsx";
import { LineChart, LineLegend } from "./LineChart";
import { QueryGate } from "./QueryGate";

type Metric = { wape: number };
type Evidence = {
  aggregate: Record<string, Metric>;
  sources: Record<string, { label: string }>;
  effects: Record<string, { wapeGain: number; improvedWindows: number; totalWindows: number }>;
};
type Forecasts = { variants: Record<string, Record<string, number[]>> };
async function load<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) throw new Error("Не удалось загрузить проверку внешних факторов");
  return response.json();
}
const pct = (value: number) => `${(value * 100).toFixed(3)} %`;
const gain = (value: number) => `${value > 0 ? "+" : ""}${(value * 100).toFixed(3)} п.п.`;

/** Reproducible development ablations, displayed separately from the submitted champion. */
export function FactorEvidencePanel() {
  const [factor, setFactor] = useState("weather");
  const [route, setRoute] = useState("17");
  const [date, setDate] = useState("2025-11-15");
  const report = useQuery({ queryKey: ["factor-evidence"], queryFn: () => load<Evidence>("/factors/evidence.json"), staleTime: 300_000 });
  const forecasts = useQuery({ queryKey: ["factor-forecasts"], queryFn: () => load<Forecasts>("/factors/forecasts.json"), staleTime: 300_000 });
  return <Panel title="Внешние факторы: проверка эффекта">
    <QueryGate q={report}>{() => {
      const data = report.data!;
      return <div className="flex flex-col gap-5">
        <p className="text-body-s text-text-secondary">
          Отдельная экспериментальная модель CatBoost с четырьмя категориями факторов.
          WAPE всех факторов: {pct(data.aggregate.all.wape)}. Это историческая проверка разработки,
          а не score конкурсного файла 0,89212. Меньше WAPE — лучше.
        </p>
        <div className="overflow-x-auto"><table className="w-full text-left text-caption tabular-nums">
          <thead><tr><th>Убираемый источник</th><th>WAPE без него</th><th>Эффект включения</th><th>Улучшенных окон</th></tr></thead>
          <tbody>{Object.entries(data.sources).map(([key, source]) => <tr key={key}>
            <td className="py-2">{source.label}</td><td>{pct(data.aggregate[`without_${key}`].wape)}</td>
            <td className={data.effects[key].wapeGain > 0 ? "text-status-ok" : "text-status-warn"}>{gain(data.effects[key].wapeGain)}</td>
            <td>{data.effects[key].improvedWindows} из {data.effects[key].totalWindows}</td>
          </tr>)}</tbody>
        </table></div>
        <p className="text-caption text-text-muted">Плюс — источник уменьшил ошибку; минус — увеличил. Каждая версия заново обучена на одинаковых строках и с одинаковыми параметрами, без одной категории признаков. Эффекты могут зависеть друг от друга и не складываются.</p>
        <a className="text-caption underline" href="/factors/evidence.json" download>Скачать полный отчёт JSON</a>
        <div className="mt-eyebrow">Как меняется прогноз без выбранного фактора</div>
        <div className="flex flex-wrap gap-3">
          <Select value={factor} aria-label="Убираемый фактор" onChange={e => setFactor(e.target.value)} options={Object.entries(data.sources).map(([value, source]) => ({ value, label: source.label }))} />
          <Select value={route} aria-label="Маршрут экспериментальной модели" onChange={e => setRoute(e.target.value)} options={["1", "7", "11", "12", "17", "25", "26", "28", "50"].map(value => ({ value, label: `Маршрут ${value}` }))} />
          <Input type="date" aria-label="Дата экспериментального прогноза" min="2025-11-01" max="2025-12-31" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <QueryGate q={forecasts}>{() => {
          const full = forecasts.data!.variants.all[`${route}:${date}`];
          const without = forecasts.data!.variants[`without_${factor}`][`${route}:${date}`];
          if (!full || !without) return <p>Выберите дату с 1 ноября по 31 декабря 2025.</p>;
          const lines = [{ label: "Все факторы", color: "var(--brand-accent)", values: full },
            { label: `Без: ${data.sources[factor].label}`, color: "var(--cyan-500)", dashed: true, values: without }];
          return <><LineLegend series={lines} /><LineChart ariaLabel="Сравнение моделей с фактором и без него" series={lines} labels={full.map((_, h) => `${String(h).padStart(2, "0")}:00`)} height={180} /></>;
        }}</QueryGate>
        <p className="text-caption text-text-muted">Показаны прогнозы пяти сохранённых моделей, обученных до 01.11.2025. Переключение не меняет основную модель диспетчера. Ползунки диспетчера задают ручной сценарий, а здесь измеряется эффект состава входных данных.</p>
      </div>;
    }}</QueryGate>
  </Panel>;
}
