import React from "react";
import { cn } from "@/lib/utils";
import { Badge, Stat, Select } from "../../components";
import { Sparkline } from "../../products/forecast-dashboard/Charts";
import { Panel } from "../../products/forecast-dashboard/Shell";
import type { DeviationItem, DrillTarget, FactorItem, PeriodOption } from "./data";

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
  onSelect?: (target: DrillTarget | undefined) => void;
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
            key={z.title}
            role={z.drillTo ? "button" : undefined}
            onClick={z.drillTo ? () => onSelect && onSelect(z.drillTo) : undefined}
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
              <Badge tone={z.tone}>{z.relDeviation}</Badge>
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

export interface PeriodCompareProps {
  options: PeriodOption[];
  style?: React.CSSProperties;
}

/** "Сравнение периодов" — произвольные период A / период B, диспетчер выбирает месяц↔месяц
 *  или неделю↔неделю через один и тот же список; разница считается на бэкенде, здесь — заглушка. */
export function PeriodCompare({ options, style }: PeriodCompareProps) {
  const [a, setA] = React.useState(options[0]?.value);
  const [b, setB] = React.useState(options[1]?.value ?? options[0]?.value);
  const labelFor = (v?: string) => options.find((o) => o.value === v)?.label ?? "";
  return (
    <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-5" style={style}>
      <Select label="Период A" value={a} onChange={(e) => setA(e.target.value)} options={options} />
      <Select label="Период B" value={b} onChange={(e) => setB(e.target.value)} options={options} />
      <Stat label="Разница" value="9.4" unit="%" trend={{ dir: "up", value: "9.4 %" }} caption={`${labelFor(a)} → ${labelFor(b)}`} />
    </div>
  );
}

export interface PlaceholderCardProps {
  title: string;
  note: string;
}

/** Reusable card type for sections whose mechanic is not yet finalized. */
export function PlaceholderCard({ title, note }: PlaceholderCardProps) {
  return (
    <Panel title={title} action={<Badge tone="neutral">черновик</Badge>}>
      <div className="flex min-h-35 items-center justify-center rounded-md border border-dashed border-border-default p-6 text-center text-body-s text-text-muted">
        {note}
      </div>
    </Panel>
  );
}
