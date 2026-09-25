import React from "react";
import { Toast, Icon } from "../../components";
import { Sidebar, TopBar } from "./Shell";
import { Overview, RouteView, ModelView } from "./Screens";
import { MapView, IngestView } from "./MapScreens";

export default function DashApp() {
  const [view, setView] = React.useState("map");
  const [horizon, setHorizon] = React.useState("day");
  const [route, setRoute] = React.useState("17");
  const [toast, setToast] = React.useState(false);
  const full = view === "map";
  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-page)", position: "relative" }}>
      <Sidebar view={view} onView={setView} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <TopBar horizon={horizon} onHorizon={setHorizon} route={route} onRoute={setRoute}
          onExport={() => { setToast(true); setTimeout(() => setToast(false), 3500); }} />
        <main style={{ flex: 1, minHeight: 0, overflowY: full ? "hidden" : "auto", padding: full ? "var(--space-5) var(--space-6)" : "var(--space-6) var(--space-8) var(--space-10)" }}>
          {view === "map" && <MapView route={route} />}
          {view === "overview" && <Overview horizon={horizon} route={route} />}
          {view === "route" && <RouteView route={route} />}
          {view === "model" && <ModelView />}
          {view === "data" && <IngestView />}
        </main>
      </div>
      {toast && <div style={{ position: "absolute", right: 24, bottom: 24, zIndex: 600 }}>
        <Toast tone="ok" icon={<Icon name="check" size={16} />} title="Выгрузка готова" description={`Маршрут ${route} · горизонт ${horizon} · CSV 2.4 МБ`} onClose={() => setToast(false)} />
      </div>}
    </div>
  );
}
