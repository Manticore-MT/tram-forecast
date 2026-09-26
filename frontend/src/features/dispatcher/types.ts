import type { Place } from "./store";
import type { FormattedRecommendation } from "./recommendation";

export interface DeviationItem {
  title: string;
  absDeviation: string;
  relDeviation: string;
  peakTime: string;
  tone: "danger" | "warn" | "ok";
  selected?: boolean;
  /** Where a click on the item leads in the сеть/маршрут/остановка drill-down. */
  drillTo?: Place;
  /** Dispatcher action recommendation, network-level zones only. */
  action?: FormattedRecommendation | null;
}

export interface FactorItem {
  label: string;
  detail?: string;
}

