import { AttentionZones, TimeControls, DetailPanel, FooterNote } from "./shared";
import { MapCanvas } from "./MapCanvas";
import type { LayoutProps } from "./ColumnsLayout";

/** Вариант В · Панель + таблица снизу — map + detail panel on top, attention zones as a wide table below. */
export function PanelTableLayout({ data, level }: LayoutProps) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1fr 300px", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", minHeight: 0 }}>
          <MapCanvas level={level} caption={data.mapCaption} activeIndex={data.activeIndex} style={{ flex: 1, minHeight: 0 }} />
          <TimeControls />
        </div>
        <DetailPanel data={data} style={{ overflowY: "auto" }} />
      </div>
      <AttentionZones zones={data.zones} layout="table" style={{ flex: "0 0 auto" }} />
      <FooterNote variant="panel-table" />
    </div>
  );
}
