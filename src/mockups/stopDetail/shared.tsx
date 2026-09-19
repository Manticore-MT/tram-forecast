import React from "react";
import { Card, Badge, Stat, Tabs } from "../../components";
import { Sparkline, seedSeries } from "../../products/forecast-dashboard/Charts";
import type { LevelData, Variant, ZoneItem } from "./data";
import { VARIANT_NOTES } from "./data";

export interface AttentionZonesProps {
  zones: ZoneItem[];
  /** "list" stacks cards; "table" lays each zone out as a wide row */
  layout?: "list" | "table";
  style?: React.CSSProperties;
}

/** Reused as-is across all 3 layout variants and all 3 levels — only the data changes. */
export function AttentionZones({ zones, layout = "list", style }: AttentionZonesProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", ...style }}>
      <div className="mt-eyebrow">Зоны внимания</div>
      <div style={{ display: "flex", flexDirection: layout === "table" ? "row" : "column", flexWrap: "wrap", gap: "var(--space-2)" }}>
        {zones.map((z) => (
          <div key={z.title} style={{
            flex: layout === "table" ? "1 1 260px" : "none",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)",
            padding: "var(--space-3) var(--space-4)", borderRadius: "var(--radius-md)",
            background: z.selected ? "var(--accent-quiet)" : "var(--bg-surface-2)",
            boxShadow: z.selected ? "inset 0 0 0 1px rgba(240,57,43,.35)" : "var(--inset-hairline)",
          }}>
            <span style={{ font: "var(--type-ui-s)", color: z.selected ? "var(--text-accent)" : "var(--text-primary)" }}>{z.title}</span>
            <Badge tone={z.tone}>{z.meta}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface TimeControlsProps {
  style?: React.CSSProperties;
}

export function TimeControls({ style }: TimeControlsProps) {
  const [period, setPeriod] = React.useState("day");
  const [hour, setHour] = React.useState(14);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", ...style }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Tabs value={period} onChange={setPeriod} items={[{ value: "day", label: "день" }]} />
        <span style={{ font: "var(--type-mono-s)", color: "var(--text-secondary)" }}>{String(hour).padStart(2, "0")}:00</span>
      </div>
      <input type="range" min={5} max={23} step={1} value={hour} onChange={(e) => setHour(+e.target.value)}
        style={{ width: "100%", accentColor: "var(--accent)" }} />
    </div>
  );
}

export interface DetailPanelProps {
  data: LevelData;
  style?: React.CSSProperties;
}

/** The single reusable "entity detail" card — content varies by level, shape never does. */
export function DetailPanel({ data, style }: DetailPanelProps) {
  const [tab, setTab] = React.useState("base");
  const dynamics = React.useMemo(() => seedSeries(5, 24, 40, 60), []);
  return (
    <Card tone="raised" padding="var(--space-6)" style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)", ...style }}>
      <div style={{ font: "var(--type-h4)" }}>{data.panelTitle}</div>
      <Tabs variant="pill" value={tab} onChange={setTab} items={[{ value: "base", label: "базовый" }, { value: "factor", label: "с фактором" }]} />
      <div>
        <div className="mt-eyebrow">{data.metricLabel}</div>
        <Stat value={data.metricValue} unit={data.metricUnit} size="lg" />
      </div>
      <div>
        <div className="mt-eyebrow">отклонение</div>
        <div style={{ marginTop: 4, font: "var(--type-h3)", color: data.deviationTone === "danger" ? "var(--status-danger)" : data.deviationTone === "warn" ? "var(--status-warn)" : "var(--status-ok)" }}>{data.deviationValue}</div>
      </div>
      <div>
        <div className="mt-eyebrow" style={{ marginBottom: "var(--space-2)" }}>динамика</div>
        <Sparkline data={dynamics} />
      </div>
      <div>
        <div className="mt-eyebrow" style={{ marginBottom: "var(--space-2)" }}>факторы</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
          {data.factors.map((f) => <span key={f}>{f}</span>)}
        </div>
      </div>
    </Card>
  );
}

export function FooterNote({ variant }: { variant: Variant }) {
  const n = VARIANT_NOTES[variant];
  return (
    <div style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>
      <span style={{ color: "var(--status-ok)" }}>+ {n.pro}</span> · <span style={{ color: "var(--status-warn)" }}>− {n.con}</span>
    </div>
  );
}
