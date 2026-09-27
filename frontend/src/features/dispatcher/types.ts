import type { Place } from "./store";
import type { FormattedRecommendation } from "./recommendation";

export interface DeviationItem {
  title: string;
  absDeviation: string;
  relDeviation: string;
  /** Omitted when the title is already a time label (e.g. route-level time-point zones). */
  peakTime?: string;
  tone: "danger" | "warn" | "ok";
  selected?: boolean;
  /** Where a click on the item leads in the сеть/маршрут drill-down. */
  drillTo?: Place;
  /** Index of the point this item refers to within the current window's series — moves the time
   *  focus there on click, instead of navigating (used by route-level time-point zones). */
  focusIndex?: number;
  /** Dispatcher action recommendation, network-level zones only. */
  action?: FormattedRecommendation | null;
}

export interface FactorItem {
  label: string;
  detail?: string;
}

