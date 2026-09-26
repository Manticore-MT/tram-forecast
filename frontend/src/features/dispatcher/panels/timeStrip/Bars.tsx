import React from "react";
import { cn } from "@/lib/utils";
import { useMeta } from "../../../../api/hooks";
import { LOAD_VARS, loadStep } from "../../../../shared/load";
import { useDispatcher } from "../../store";
import { useFocusIndex, type SeriesPoint } from "../../forecast";
import { SCALE_UNITS, nowPosition, pointLabel, type Scale } from "../../time";
import { fmtInt } from "../../format";

// Rough label widths in px, used to thin the axis so neighbours never overlap.
const LABEL_PX: Record<Scale, number> = { day: 40, week: 56, month: 52, year: 44 };
const MIN_STEP: Record<Scale, number> = { day: 3, week: 1, month: 5, year: 1 };
const DAY_STEPS = [3, 4, 6, 12];
/** Bars top out below the area's ceiling, leaving room for the «сейчас» caption. */
const HEADROOM = 1.25;

/** `gap`: fewest columns between two labels that don't overlap; `step`: regular label spacing. */
function labelSpacing(scale: Scale, n: number, width: number): { gap: number; step: number } {
  const gap = width > 0 ? Math.ceil((n * LABEL_PX[scale]) / width) : 1;
  const step = Math.max(MIN_STEP[scale], gap);
  return { gap, step: scale === "day" ? (DAY_STEPS.find((s) => s >= step) ?? 12) : step };
}

function useWidth(ref: React.RefObject<HTMLElement | null>): number {
  const [width, setWidth] = React.useState(0);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

export interface BarsProps {
  points: SeriesPoint[];
  /** The uncorrected forecast, drawn as an outline while a scenario is on. */
  ghost: SeriesPoint[] | null;
  dimmed: boolean;
}

/** One bar per point of the window; click, drag or arrow keys move the focus. */
export function Bars({ points, ghost, dimmed }: BarsProps) {
  const scale = useDispatcher((s) => s.scale);
  const setFocus = useDispatcher((s) => s.setFocus);
  const drillTime = useDispatcher((s) => s.drillTime);
  const scaleUp = useDispatcher((s) => s.scaleUp);
  const focus = useFocusIndex(points);
  const now = useMeta().data?.now;
  const ref = React.useRef<HTMLDivElement>(null);
  const width = useWidth(ref);
  const dragging = React.useRef(false);

  const n = points.length;
  // No vehicle-capacity data yet, so load is relative to the window's peak.
  const max = Math.max(1, ...points.map((p) => p.forecast), ...(ghost ?? []).map((p) => p.forecast));
  const nowPos = nowPosition(points.map((p) => p.periodStart), now);
  const { gap, step } = labelSpacing(scale, n, width);
  const focused = points[focus];
  // Time is continuous, so bars sit almost edge to edge like a histogram. The current period is
  // marked on the bar itself at every scale; the exact "now" line only helps inside an hour.
  const showNowLine = scale === "day";
  const currentIndex = nowPos !== null && nowPos < n ? Math.floor(nowPos) : -1;

  const indexAt = (clientX: number): number => {
    const rect = ref.current!.getBoundingClientRect();
    return Math.max(0, Math.min(n - 1, Math.floor(((clientX - rect.left) / rect.width) * n)));
  };
  const pick = (i: number) => {
    if (useDispatcher.getState().focus !== i) setFocus(i);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowLeft": pick(Math.max(0, focus - 1)); break;
      case "ArrowRight": pick(Math.min(n - 1, focus + 1)); break;
      case "Home": pick(0); break;
      case "End": pick(n - 1); break;
      case "Enter": if (focused) drillTime(focused.periodStart); break;
      case "Backspace":
      case "Escape": scaleUp(); break;
      default: return;
    }
    e.preventDefault();
  };

  return (
    <div
      ref={ref}
      tabIndex={0}
      role="slider"
      aria-label="Период"
      aria-orientation="horizontal"
      aria-valuemin={0}
      aria-valuemax={n - 1}
      aria-valuenow={focus}
      aria-valuetext={focused ? `${pointLabel(scale, focused.periodStart)}, ${fmtInt(focused.forecast)} ${SCALE_UNITS[scale]}` : undefined}
      onKeyDown={onKeyDown}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        dragging.current = true;
        pick(indexAt(e.clientX));
      }}
      onPointerMove={(e) => {
        if (dragging.current) pick(indexAt(e.clientX));
      }}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
      onDoubleClick={(e) => drillTime(points[indexAt(e.clientX)].periodStart)}
      className={cn(
        "relative grid h-full cursor-pointer touch-none select-none rounded-md outline-none transition-opacity",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
        dimmed && "opacity-60",
      )}
      style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
    >
      {points.map((p, i) => {
        const isFocus = i === focus;
        const past = nowPos !== null && i + 1 <= nowPos;
        const current = currentIndex === i;
        const g = ghost?.[i];
        // The focused label is always shown; regular labels too close to it step aside.
        const labelled = isFocus || current || (i % step === 0 && Math.abs(i - focus) >= gap && Math.abs(i - currentIndex) >= gap);
        return (
          <div key={p.periodStart} className="flex min-w-0 flex-col px-px">
            <div className={cn("relative flex h-14 items-end justify-center rounded-sm", isFocus && "bg-glass-fill")}>
              <div
                className={cn(
                  "w-full rounded-t-xs transition-[height,opacity]",
                  past && !isFocus && "opacity-40",
                  current && "shadow-[inset_0_2px_0_0_var(--text-accent)]",
                  isFocus && "outline-2 outline-offset-1 outline-text-primary",
                )}
                style={{
                  height: `${(p.forecast / (max * HEADROOM)) * 100}%`,
                  minHeight: p.forecast > 0 ? 2 : 0,
                  background: LOAD_VARS[loadStep(p.forecast / max)],
                }}
              />
              {g && (
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 rounded-t-xs border border-b-0 border-dashed border-text-secondary"
                  style={{ height: `${(g.forecast / (max * HEADROOM)) * 100}%` }}
                />
              )}
            </div>
            <div
              className={cn(
                "flex h-4 justify-center whitespace-nowrap text-caption leading-4",
                current ? "text-text-accent" : isFocus ? "text-text-primary" : "text-text-muted",
              )}
            >
              {labelled ? pointLabel(scale, p.periodStart) : ""}
            </div>
          </div>
        );
      })}
      {showNowLine && nowPos !== null && nowPos > 0 && nowPos < n && (
        <div
          className="pointer-events-none absolute top-0 h-14 w-px bg-text-primary"
          style={{ left: `${(nowPos / n) * 100}%` }}
        >
          <span
            className={cn(
              "absolute top-0 text-caption leading-none text-text-secondary",
              nowPos / n > 0.9 ? "right-full pr-1" : "left-full pl-1",
            )}
          >
            сейчас
          </span>
        </div>
      )}
    </div>
  );
}
