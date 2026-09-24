export type DispatcherLevel = "all" | "line" | "stop";

export interface DrillTarget {
  level: DispatcherLevel;
  route?: string;
  stopIndex?: number;
}

export interface DeviationItem {
  title: string;
  absDeviation: string;
  relDeviation: string;
  peakTime: string;
  tone: "danger" | "warn" | "ok";
  selected?: boolean;
  /** Present when the item is part of the вся-сеть/маршрут/остановка drill-down. */
  drillTo?: DrillTarget;
}

export interface FactorItem {
  label: string;
  detail?: string;
}

export interface DetailData {
  title: string;
  baselineLabel: string;
  baselineValue: string;
  forecastLabel: string;
  forecastValue: string;
  deviationValue: string;
  unit: string;
  factors: FactorItem[];
}

export const NETWORK_FACTORS: FactorItem[] = [
  { label: "Календарь", detail: "рабочие дни недели" },
  { label: "Погода", detail: "осадки по прогнозу Гидрометцентра" },
  { label: "ВСМ", detail: "расписание прибытий на вокзалы" },
];

export const PEAKS: DeviationItem[] = [
  { title: "Утренний пик", absDeviation: "+310 чел/ч", relDeviation: "+22 %", peakTime: "08:30" },
  { title: "Вечерний пик", absDeviation: "+420 чел/ч", relDeviation: "+38 %", peakTime: "18:40" },
] as DeviationItem[];

export const QUALITY_METRICS: [string, string, string][] = [
  ["MAPE", "7.4", "%"],
  ["RMSE", "48.2", ""],
  ["R²", "0.91", ""],
];

export const ROUTE_BREAKDOWN: [string, string, string][] = [
  ["Маршрут № 17", "+18 %", "08:30"],
  ["Маршрут № 3", "+9 %", "17:50"],
  ["Остановка «Лефортово»", "−6 %", "—"],
];

export interface PeriodOption {
  value: string;
  label: string;
}

export const PERIOD_OPTIONS: PeriodOption[] = [
  { value: "month-8", label: "Август 2026" },
  { value: "month-9", label: "Сентябрь 2026" },
  { value: "week-36", label: "Неделя 36" },
  { value: "week-37", label: "Неделя 37" },
];

export interface QualityHistoryItem {
  date: string;
  title: string;
  note: string;
  done?: boolean;
}

export const QUALITY_HISTORY: QualityHistoryItem[] = [
  { date: "13.09", title: "v14 · MAPE 7.4 %", note: "в проде", done: true },
  { date: "06.09", title: "v13 · MAPE 8.1 %", note: "архив" },
  { date: "30.08", title: "v12 · MAPE 9.6 %", note: "архив" },
];
