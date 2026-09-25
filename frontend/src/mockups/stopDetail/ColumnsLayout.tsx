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
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "240px 1fr 300px", gap: "var(--space-4)", alignItems: "stretch" }}>
        <AttentionZones zones={data.zones} />
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", minHeight: 0 }}>
          <MapCanvas level={level} caption={data.mapCaption} activeIndex={data.activeIndex} style={{ flex: 1, minHeight: 0 }} />
          <TimeControls />
        </div>
        <DetailPanel data={data} style={{ overflowY: "auto" }} />
      </div>
      <FooterNote variant="columns" />
    </div>
  );
}
