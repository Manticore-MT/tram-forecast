import type { Place } from "./store";

export interface DeviationItem {
  title: string;
  absDeviation: string;
  relDeviation: string;
  peakTime: string;
  tone: "danger" | "warn" | "ok";
  selected?: boolean;
  /** Where a click on the item leads in the сеть/маршрут/остановка drill-down. */
  drillTo?: Place;
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
