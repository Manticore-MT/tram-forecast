import type { components } from "../../api/schema.d.ts";

export type Recommendation = components["schemas"]["Recommendation"];

export interface FormattedRecommendation {
  label: string;
}

function pluralTrams(n: number): string {
  const abs = Math.abs(n);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod10 === 1 && mod100 !== 11) return "трамвай";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "трамвая";
  return "трамваев";
}

/** «+1 трамвай», «−2 трамвая» — null when there's nothing to act on. A prescription, not a status,
 *  so it never carries a severity color — that vocabulary belongs to the deviation alone (see
 *  DetailsPanel's plain-text "Рекомендация" Stat, which this now matches). */
export function formatRecommendation(rec?: Recommendation): FormattedRecommendation | null {
  if (!rec?.action || rec.action === "NONE") return null;
  const n = rec.vehicles ?? 1;
  if (rec.action === "ADD_VEHICLE") {
    return { label: `+${n} ${pluralTrams(n)}` };
  }
  if (rec.action === "REMOVE_VEHICLE") {
    return { label: `−${n} ${pluralTrams(n)}` };
  }
  return null;
}
