import React from "react";
import { cn } from "@/lib/utils";
import { Badge, Stat } from "../../components";
import { Sparkline } from "../../shared/charts";
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
  /** Called with the item's drillTo when it's clickable — powers the вся-сеть/маршрут/остановка hierarchy. */
  onSelect?: (place: Place) => void;
}

/** Reusable "список с отклонениями" — зоны внимания, прогнозируемые пики, рейтинг проблемных мест.
 *  Rows, not cards: a card per row inside a card that's already inside a card reads as noise —
 *  selection and interactivity are carried by a left accent bar and a hairline divider instead. */
export function DeviationList({ title, items, layout = "list", style, onSelect }: DeviationListProps) {
  return (
    <div className="flex flex-col gap-3" style={style}>
      <div className="mt-eyebrow">{title}</div>
      <div className={cn("flex flex-wrap", layout === "table" ? "flex-row" : "flex-col")}>
        {items.map((z, i) => (
          <div
            key={`${z.title}-${i}`}
            role={z.drillTo ? "button" : undefined}
            onClick={z.drillTo ? () => onSelect?.(z.drillTo!) : undefined}
            className={cn(
              "flex items-center justify-between gap-3 py-3 pr-2 pl-3",
              layout === "table" ? "flex-[1_1_260px]" : "flex-none",
              z.selected ? "border-l-[3px] border-l-brand" : "border-l-[3px] border-l-transparent",
              layout !== "table" && i !== items.length - 1 && "border-b border-b-border-subtle",
              z.drillTo && "cursor-pointer"
            )}
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className={cn("text-ui-s", z.selected ? "text-brand" : "text-text-primary")}>{z.title}</span>
              <span className="text-caption text-text-muted">пик {z.peakTime}</span>
            </div>
            <div className="flex flex-none flex-col items-end gap-0.5">
              <div className="flex items-center gap-1">
                {z.action && (
                  <Badge tone={z.action.tone}>{z.action.label}</Badge>
                )}
                <Badge tone={z.tone}>{z.relDeviation}</Badge>
              </div>
              <span className="text-mono-s text-text-muted">{z.absDeviation}</span>
            </div>
          </div>
        ))}
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
