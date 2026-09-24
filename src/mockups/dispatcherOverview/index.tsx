import React from "react";
import { Tabs } from "../../components";
import { DispatcherScreen } from "./DispatcherScreen";
import { OverviewScreen } from "./OverviewScreen";

type Screen = "dispatcher" | "overview";

/** Two-screen mockup: dispatcher map overlay (US1-6) and stakeholder overview grid (US7-10),
 *  assembled from the design system's existing components — no new styles, placeholder data only. */
export default function DispatcherOverviewMockup() {
  const [screen, setScreen] = React.useState<Screen>("dispatcher");
  const full = screen === "dispatcher";
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-page)", color: "var(--text-primary)", padding: "var(--space-6) var(--space-8)" }}>
      <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", gap: "var(--space-2)", marginBottom: "var(--space-6)" }}>
        <div className="mt-eyebrow">Поток · Диспетчер и обзор сети · макет из компонентов дизайн-системы</div>
        <Tabs value={screen} onChange={(v) => setScreen(v as Screen)} items={[
          { value: "dispatcher", label: "Диспетчер" },
          { value: "overview", label: "Обзор" },
        ]} />
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: full ? "hidden" : "auto" }}>
        {screen === "dispatcher" ? <DispatcherScreen /> : <OverviewScreen />}
      </div>
    </div>
  );
}
