// Time model: a scale (= API horizon) plus a cursor date. The API window is derived from both:
// day = the cursor day (hourly points), week = 7 days from the cursor (daily), month = the
// calendar month containing the cursor (daily), year = its calendar year (monthly).
// Dates are "YYYY-MM-DD" strings in Europe/Moscow; arithmetic runs in UTC on the bare date so the
// browser's own time zone never shifts a day.
import type { Horizon } from "../../api/hooks";

export type Scale = Horizon;

/** Smallest to largest — "up" moves right in this list. */
export const SCALES: Scale[] = ["day", "week", "month", "year"];

export const SCALE_LABELS: Record<Scale, string> = {
  day: "День",
  week: "7 дней",
  month: "Месяц",
  year: "Год",
};

/** Unit of one point's value. Assumes the API returns passengers per period — still an open
 *  question in docs/ml-contract.md. */
export const SCALE_UNITS: Record<Scale, string> = {
  day: "пасс/ч",
  week: "пасс/сут",
  month: "пасс/сут",
  year: "пасс/мес",
};

function parse(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function format(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  const d = parse(date);
  d.setUTCDate(d.getUTCDate() + days);
  return format(d);
}

export function addMonths(date: string, months: number): string {
  const d = parse(date);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return format(d);
}

/** Moves the cursor by one window: a day, 7 days, a month or a year. */
export function shiftCursor(scale: Scale, cursor: string, dir: -1 | 1): string {
  switch (scale) {
    case "day": return addDays(cursor, dir);
    case "week": return addDays(cursor, 7 * dir);
    case "month": return addMonths(cursor, dir);
    case "year": return addMonths(cursor, 12 * dir);
  }
}

export function scaleUp(scale: Scale): Scale | null {
  return SCALES[SCALES.indexOf(scale) + 1] ?? null;
}

/** Where a click on one point of the window leads: a month of the year, or a day of a week/month.
 *  `periodStart` is the point's ISO timestamp in Moscow time, so its first 10 chars are its date. */
export function drillDown(scale: Scale, periodStart: string): { scale: Scale; cursor: string } | null {
  const date = periodStart.slice(0, 10);
  switch (scale) {
    case "year": return { scale: "month", cursor: date.slice(0, 8) + "01" };
    case "month":
    case "week": return { scale: "day", cursor: date };
    case "day": return null;
  }
}

const utc = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("ru-RU", { ...opts, timeZone: "UTC" });
const WEEKDAY_DAY_MONTH_YEAR = utc({ weekday: "short", day: "numeric", month: "long", year: "numeric" });
const DAY_SHORT_MONTH = utc({ day: "numeric", month: "short" });
const MONTH_YEAR = utc({ month: "long", year: "numeric" });
const SHORT_MONTH = utc({ month: "short" });
const WEEKDAY_DAY = utc({ weekday: "short", day: "numeric" });

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "пт, 26 сентября 2026" · "26 сент. – 2 окт." · "Сентябрь 2026" · "2026" */
export function windowLabel(scale: Scale, cursor: string): string {
  const d = parse(cursor);
  switch (scale) {
    case "day": return WEEKDAY_DAY_MONTH_YEAR.format(d);
    case "week": return `${DAY_SHORT_MONTH.format(d)} – ${DAY_SHORT_MONTH.format(parse(addDays(cursor, 6)))}`;
    case "month": return capitalize(MONTH_YEAR.format(d).replace(/\s*г\.$/, ""));
    case "year": return String(d.getUTCFullYear());
  }
}

/** Axis label of one point: "18:00" for a day, "пт, 26" for week/month days, "сент." for months. */
export function pointLabel(scale: Scale, periodStart: string): string {
  if (scale === "day") return periodStart.slice(11, 16);
  const d = parse(periodStart.slice(0, 10));
  return scale === "year" ? SHORT_MONTH.format(d) : WEEKDAY_DAY.format(d);
}

/** Index of the point whose period contains `now`, or -1 when `now` is outside the window. */
export function nowIndex(periodStarts: string[], now: string | undefined): number {
  if (!now || periodStarts.length === 0) return -1;
  const t = Date.parse(now);
  if (t < Date.parse(periodStarts[0])) return -1;
  for (let i = periodStarts.length - 1; i >= 0; i--) {
    if (Date.parse(periodStarts[i]) <= t) {
      // Past the last point's start: inside the window only if the window hasn't ended yet,
      // which the step between points tells us.
      if (i === periodStarts.length - 1 && periodStarts.length > 1) {
        const step = Date.parse(periodStarts[i]) - Date.parse(periodStarts[i - 1]);
        return t < Date.parse(periodStarts[i]) + step ? i : -1;
      }
      return i;
    }
  }
  return -1;
}

/** Where `now` falls in the window, counted in points: 2.5 = halfway through the third period.
 *  Clamped to 0 (window is ahead) … n (window is over); null without a clock or points. */
export function nowPosition(periodStarts: string[], now: string | undefined): number | null {
  const n = periodStarts.length;
  if (!now || n === 0) return null;
  const t = Date.parse(now);
  const starts = periodStarts.map((s) => Date.parse(s));
  for (let i = n - 1; i >= 0; i--) {
    if (starts[i] > t) continue;
    const step = i + 1 < n ? starts[i + 1] - starts[i] : n > 1 ? starts[i] - starts[i - 1] : 1;
    return Math.min(n, i + (t - starts[i]) / step);
  }
  return 0;
}

/** The focused point: the user's pick if valid, else "now" when it's in the window, else the first. */
export function resolveFocus(focus: number | null, periodStarts: string[], now: string | undefined): number {
  if (periodStarts.length === 0) return -1;
  if (focus !== null && focus >= 0 && focus < periodStarts.length) return focus;
  return Math.max(0, nowIndex(periodStarts, now));
}
