import React from "react";
import { Tabs } from "../../components";
import { LEVELS, VARIANTS, LEVEL_DATA, Level, Variant } from "./data";
import { ColumnsLayout } from "./ColumnsLayout";
import { OverlayLayout } from "./OverlayLayout";
import { PanelTableLayout } from "./PanelTableLayout";

const LAYOUTS: Record<Variant, typeof ColumnsLayout> = {
  columns: ColumnsLayout,
  overlay: OverlayLayout,
  "panel-table": PanelTableLayout,
};

/** 9 combinations (3 layout variants × 3 layer levels), switched by the top selector bar. */
export default function StopDetailCompare() {
  const [variant, setVariant] = React.useState<Variant>("columns");
  const [level, setLevel] = React.useState<Level>("stop");
  const Layout = LAYOUTS[variant];
  const data = LEVEL_DATA[level];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", color: "var(--text-primary)", padding: "var(--space-6) var(--space-8)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginBottom: "var(--space-6)" }}>
        <div className="mt-eyebrow">Поток · Макеты «остановка/маршрут» · 9 вариантов</div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-6)" }}>
          <Tabs value={variant} onChange={(v) => setVariant(v as Variant)} items={VARIANTS.map((v) => ({ value: v.value, label: v.label }))} />
          <Tabs value={level} onChange={(v) => setLevel(v as Level)} items={LEVELS.map((l) => ({ value: l.value, label: l.label }))} />
        </div>
        <div style={{ font: "var(--type-body-s)", color: "var(--text-muted)" }}>
          {VARIANTS.find((v) => v.value === variant)?.label} · {data.levelLabel}
        </div>
      </div>

      <Layout data={data} level={level} />
    </div>
  );
}
