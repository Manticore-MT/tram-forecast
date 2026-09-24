import React from "react";
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
      {spark && <div style={{ marginTop: "var(--space-4)" }}><Sparkline data={spark} /></div>}
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
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", ...style }}>
      <div className="mt-eyebrow">{title}</div>
      <div style={{ display: "flex", flexDirection: layout === "table" ? "row" : "column", flexWrap: "wrap" }}>
        {items.map((z, i) => (
          <div key={z.title} role={z.drillTo ? "button" : undefined}
            onClick={z.drillTo ? () => onSelect && onSelect(z.drillTo) : undefined}
            style={{
              flex: layout === "table" ? "1 1 260px" : "none",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)",
              padding: "var(--space-3) var(--space-2) var(--space-3) var(--space-3)",
              borderLeft: `3px solid ${z.selected ? "var(--accent)" : "transparent"}`,
              borderBottom: layout === "table" || i === items.length - 1 ? "none" : "1px solid var(--border-subtle)",
              cursor: z.drillTo ? "pointer" : undefined,
            }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
              <span style={{ font: "var(--type-ui-s)", color: z.selected ? "var(--text-accent)" : "var(--text-primary)" }}>{z.title}</span>
              <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>пик {z.peakTime}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flex: "0 0 auto" }}>
              <Badge tone={z.tone}>{z.relDeviation}</Badge>
              <span style={{ font: "var(--type-mono-s)", color: "var(--text-muted)" }}>{z.absDeviation}</span>
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
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", ...style }}>
      <div className="mt-eyebrow">{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {factors.map((f) => (
          <div key={f.label} style={{ display: "flex", flexDirection: "column", gap: 2, padding: "var(--space-2) 0" }}>
            <span style={{ font: "var(--type-body-s)", color: "var(--text-primary)" }}>{f.label}</span>
            {f.detail && <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>{f.detail}</span>}
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
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "var(--space-5)", alignItems: "end", ...style }}>
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
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", minHeight: 140,
        borderRadius: "var(--radius-md)", border: "1px dashed var(--border-default)",
        font: "var(--type-body-s)", color: "var(--text-muted)", textAlign: "center", padding: "var(--space-6)",
      }}>{note}</div>
    </Panel>
  );
}
