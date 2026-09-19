import { AttentionZones, TimeControls, DetailPanel, FooterNote } from "./shared";
import { MapCanvas } from "./MapCanvas";
import type { LevelData } from "./data";

export interface LayoutProps {
  data: LevelData;
  level: "all" | "line" | "stop";
}

/** Вариант А · Колонки — three fixed columns, nothing overlaps the map. */
export function ColumnsLayout({ data, level }: LayoutProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 300px", gap: "var(--space-4)", alignItems: "stretch" }}>
        <AttentionZones zones={data.zones} />
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <MapCanvas level={level} caption={data.mapCaption} activeIndex={data.activeIndex} />
          <TimeControls />
        </div>
        <DetailPanel data={data} />
      </div>
      <FooterNote variant="columns" />
    </div>
  );
}
