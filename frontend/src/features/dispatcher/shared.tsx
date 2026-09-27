import React from "react";
import { cn } from "@/lib/utils";
import { Badge, Stat } from "../../components";
import { Sparkline } from "../../shared/charts";
import { TONE_BORDER, TONE_TEXT } from "./format";
import type { DeviationItem, FactorItem } from "./types";
import type { Place } from "./store";

export interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  caption?: string;
  trend?: { dir: "up" | "down"; value: string };
  spark?: number[];
}

/** Reusable "метрика-число" block. No card chrome of its own — it always lives inside a
 *  Panel or floating glass card already, and a card inside a card reads as visual noise. */
export function MetricCard({ label, value, unit, caption, trend, spark }: MetricCardProps) {
  return (
    <div>
      <Stat label={label} value={value} unit={unit} caption={caption} trend={trend} size="lg" />
      {spark && (
        <div className="mt-4">
          <Sparkline data={spark} />
        </div>
      )}
    </div>
  );
}

export interface DeviationListProps {
  title: string;
  items: DeviationItem[];
  layout?: "list" | "table";
  style?: React.CSSProperties;
  /** Called with the item's drillTo when it's clickable — powers the вся-сеть/маршрут hierarchy. */
  onSelect?: (place: Place) => void;
  /** Called with the item's focusIndex when it's clickable — moves the time focus within the
   *  current window instead of navigating (route-level time-point zones). */
  onSelectIndex?: (index: number) => void;
  /** Double-click on a route-level time-point zone: drills into that point's day
   *  (a no-op at day scale — nothing to open, we're already there). */
  onDrillDay?: (periodStart: string) => void;
}

/** Reusable "список с отклонениями" — зоны внимания, прогнозируемые пики, рейтинг проблемных мест.
 *  Rows, not cards: a card per row inside a card that's already inside a card reads as noise —
 *  selection and interactivity are carried by a left accent bar and a hairline divider instead. */
export function DeviationList({ title, items, layout = "list", style, onSelect, onSelectIndex, onDrillDay }: DeviationListProps) {
  return (
    <div className="flex flex-col gap-3" style={style}>
      <div className="mt-eyebrow">{title}</div>
      <div className={cn("flex flex-wrap", layout === "table" ? "flex-row" : "flex-col")}>
        {items.map((z, i) => {
          const clickable = z.drillTo !== undefined || z.focusIndex !== undefined;
          const onClick = z.drillTo
            ? () => onSelect?.(z.drillTo!)
            : z.focusIndex !== undefined
              ? () => onSelectIndex?.(z.focusIndex!)
              : undefined;
          const onDoubleClick = z.periodStart !== undefined ? () => onDrillDay?.(z.periodStart!) : undefined;
          return (
          <div
            key={`${z.title}-${i}`}
            role={clickable ? "button" : undefined}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            className={cn(
              "flex items-center justify-between gap-3 py-3 pr-3 pl-3 border-l-[3px]",
              layout === "table" ? "flex-[1_1_260px]" : "flex-none",
              z.selected ? "bg-glass-fill" : z.tone === "danger" ? "bg-status-danger/5" : undefined,
              TONE_BORDER[z.tone],
              layout !== "table" && i !== items.length - 1 && "border-b border-b-border-subtle",
              clickable && "cursor-pointer"
            )}
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className={cn("text-ui-s", z.selected ? "text-brand" : "text-text-primary")}>{z.title}</span>
              {z.peakTime && <span className="text-caption text-text-muted">пик {z.peakTime}</span>}
            </div>
            <div className="flex flex-none flex-col items-end gap-0.5">
              <div className="flex items-baseline gap-2">
                {z.action && <Badge tone="neutral">{z.action.label}</Badge>}
                <span className={cn("text-ui-s font-mono font-semibold tabular-nums", TONE_TEXT[z.tone])}>
                  {z.relDeviation}
                </span>
              </div>
              <span className="text-mono-s text-text-secondary">{z.absDeviation}</span>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

export interface FactorsCardProps {
  title?: string;
  factors: FactorItem[];
  style?: React.CSSProperties;
}

/** Reusable card type "факторы" — учтённые факторы прогноза, с деталью (например, по ВСМ). */
export function FactorsCard({ title = "Учтённые факторы", factors, style }: FactorsCardProps) {
  return (
    <div className="flex flex-col gap-2" style={style}>
      <div className="mt-eyebrow">{title}</div>
      <div className="flex flex-col gap-2">
        {factors.map((f) => (
          <div key={f.label} className="flex flex-col gap-0.5 py-2">
            <span className="text-body-s text-text-primary">{f.label}</span>
            {f.detail && <span className="text-caption text-text-muted">{f.detail}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
