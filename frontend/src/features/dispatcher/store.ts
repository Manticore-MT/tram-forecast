// UI state shared across the dispatcher screen's panels. Server data stays in React Query;
// this holds only what the user picked. Readable outside React too (Leaflet handlers use getState()).
import { create } from "zustand";
import { DEFAULT_CORRECTIONS, type Corrections } from "../../api/hooks";
import { drillDown, scaleUp, shiftCursor, type Scale } from "./time";

/** Where on the network we are. A stop is addressed by its position on the route, because the
 *  backend's stopId doesn't match the map's stop codes yet (see docs/open-questions.md). */
export type Place =
  | { level: "network" }
  | { level: "route"; routeId: string }
  | { level: "stop"; routeId: string; stopIndex: number };

export type CorrectionKey = keyof Corrections;

interface DispatcherState {
  place: Place;
  scale: Scale;
  /** Anchor date of the time window; null until /api/meta tells us "today". */
  cursor: string | null;
  /** Index of the focused point inside the window; null = automatic ("now" if visible, else first). */
  focus: number | null;
  corrections: Corrections;
  today: string | null;
  /** Furthest date the API accepts (one year ahead). */
  latestDate: string | null;

  /** Seeds the clock from /api/meta once; later calls are no-ops. */
  init(today: string, latestDate: string): void;

  goTo(place: Place): void;
  /** stop → route → network. */
  placeUp(): void;

  setScale(scale: Scale): void;
  /** day → 7 days → month → year, keeping the cursor. */
  scaleUp(): void;
  /** Click on one point of the window: year → that month, week/month → that day. */
  drillTime(periodStart: string): void;
  shift(dir: -1 | 1): void;
  setCursor(date: string): void;
  goToday(): void;
  setFocus(index: number | null): void;

  setCorrection(key: CorrectionKey, value: number): void;
  resetCorrections(): void;
}

export const useDispatcher = create<DispatcherState>()((set, get) => ({
  place: { level: "network" },
  scale: "day",
  cursor: null,
  focus: null,
  corrections: DEFAULT_CORRECTIONS,
  today: null,
  latestDate: null,

  init(today, latestDate) {
    if (get().cursor !== null) return;
    set({ today, latestDate, cursor: today });
  },

  goTo(place) {
    set({ place });
  },

  placeUp() {
    const { place } = get();
    if (place.level === "stop") set({ place: { level: "route", routeId: place.routeId } });
    else if (place.level === "route") set({ place: { level: "network" } });
  },

  setScale(scale) {
    set({ scale, focus: null });
  },

  scaleUp() {
    const next = scaleUp(get().scale);
    if (next) set({ scale: next, focus: null });
  },

  drillTime(periodStart) {
    const target = drillDown(get().scale, periodStart);
    if (target) set({ ...target, focus: null });
  },

  shift(dir) {
    const { scale, cursor, latestDate } = get();
    if (!cursor) return;
    const next = shiftCursor(scale, cursor, dir);
    if (latestDate && next > latestDate) return;
    set({ cursor: next, focus: null });
  },

  setCursor(date) {
    set({ cursor: date, focus: null });
  },

  goToday() {
    const { today } = get();
    if (today) set({ cursor: today, focus: null });
  },

  setFocus(index) {
    set({ focus: index });
  },

  setCorrection(key, value) {
    set({ corrections: { ...get().corrections, [key]: value } });
  },

  resetCorrections() {
    set({ corrections: DEFAULT_CORRECTIONS });
  },
}));
