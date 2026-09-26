// Maps a correction value (0.1..3.0) to a 0..1000 slider position with 1.0 exactly at the
// center, so "no correction" always sits in the middle regardless of the skewed value range.
export const SLIDER_MAX = 1000;
export const SLIDER_MID = 500;
export const MIN_VALUE = 0.1;
export const MAX_VALUE = 3.0;
export const CENTER_VALUE = 1.0;

export function valueToPos(value: number): number {
  if (value <= CENTER_VALUE) {
    return ((value - MIN_VALUE) / (CENTER_VALUE - MIN_VALUE)) * SLIDER_MID;
  }
  return SLIDER_MID + ((value - CENTER_VALUE) / (MAX_VALUE - CENTER_VALUE)) * (SLIDER_MAX - SLIDER_MID);
}

export function posToValue(pos: number): number {
  const raw =
    pos <= SLIDER_MID
      ? MIN_VALUE + (pos / SLIDER_MID) * (CENTER_VALUE - MIN_VALUE)
      : CENTER_VALUE + ((pos - SLIDER_MID) / (SLIDER_MAX - SLIDER_MID)) * (MAX_VALUE - CENTER_VALUE);
  return roundValue(raw);
}

export function roundValue(value: number): number {
  // Divide last: `n * 0.05` leaks float noise (1.1500000000000001) into the request URL.
  return Math.round(value * 20) / 20;
}

export function clampValue(value: number): number {
  return Math.min(MAX_VALUE, Math.max(MIN_VALUE, value));
}

/** Parses a "1,20" / "1.20" user input into a clamped, rounded value, or null when unparsable. */
export function parseValueInput(text: string): number | null {
  const n = Number(text.replace(",", "."));
  if (!Number.isFinite(n)) return null;
  return roundValue(clampValue(n));
}
