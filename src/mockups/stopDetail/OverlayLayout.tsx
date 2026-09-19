import { Card } from "../../components";
import { AttentionZones, TimeControls, DetailPanel, FooterNote } from "./shared";
import { MapCanvas } from "./MapCanvas";
import type { LayoutProps } from "./ColumnsLayout";

/** Вариант Б · Оверлей — map fills the frame, panels float glass over it (as in products/forecast-dashboard/MapScreens.tsx). */
export function OverlayLayout({ data, level }: LayoutProps) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={{ flex: 1, minHeight: 0, position: "relative", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
        <MapCanvas level={level} caption={data.mapCaption} activeIndex={data.activeIndex} style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
        <div style={{ position: "absolute", top: 16, left: 16, width: 260, zIndex: 5 }}>
          <Card tone="glass" padding="var(--space-4)"><AttentionZones zones={data.zones} /></Card>
        </div>
        <div style={{ position: "absolute", top: 16, right: 16, width: 300, maxHeight: "calc(100% - 32px)", overflowY: "auto", zIndex: 5 }}>
          <DetailPanel data={data} style={{ background: "var(--glass-fill)", backdropFilter: "var(--blur-glass)", boxShadow: "inset 0 0 0 1px var(--glass-stroke)" }} />
        </div>
        <div style={{ position: "absolute", bottom: 16, left: 16, width: 320, zIndex: 5 }}>
          <Card tone="glass" padding="var(--space-4)"><TimeControls /></Card>
        </div>
      </div>
      <FooterNote variant="overlay" />
    </div>
  );
}
