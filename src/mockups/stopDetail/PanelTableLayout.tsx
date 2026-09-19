import { AttentionZones, TimeControls, DetailPanel, FooterNote } from "./shared";
import { MapCanvas } from "./MapCanvas";
import type { LayoutProps } from "./ColumnsLayout";

/** Вариант В · Панель + таблица снизу — map + detail panel on top, attention zones as a wide table below. */
export function PanelTableLayout({ data, level }: LayoutProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <MapCanvas level={level} caption={data.mapCaption} activeIndex={data.activeIndex} />
          <TimeControls />
        </div>
        <DetailPanel data={data} />
      </div>
      <AttentionZones zones={data.zones} layout="table" />
      <FooterNote variant="panel-table" />
    </div>
  );
}
