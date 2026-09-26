import React from "react";
import { Toast, Icon } from "../../components";
import { Sidebar, TopBar } from "./Shell";
import { Overview, RouteView, ModelView } from "./Screens";
import { MapView, IngestView, DATASET_ROUTE_NUMBERS, DEFAULT_ROUTE } from "./MapScreens";
import { useMeta } from "../../api/hooks";
import type { Horizon } from "../../api/hooks";

export default function DashApp() {
  const [view, setView] = React.useState("map");
  const [horizon, setHorizon] = React.useState<Horizon>("day");
  const [route, setRoute] = React.useState(DEFAULT_ROUTE);
  const [toast, setToast] = React.useState(false);
  const { data: meta } = useMeta();
  // The backend's server date is the source of truth; never hardcode `new Date()`.
  const [date, setDate] = React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    if (meta?.today && date === undefined) setDate(meta.today);
  }, [meta, date]);
  const effectiveDate = date ?? meta?.today;
  const full = view === "map";
  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-page)", position: "relative" }}>
      <Sidebar view={view} onView={setView} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <TopBar horizon={horizon} onHorizon={(v) => setHorizon(v as Horizon)} route={route} onRoute={setRoute} routes={DATASET_ROUTE_NUMBERS}
          onExport={() => { setToast(true); setTimeout(() => setToast(false), 3500); }} />
        <main style={{ flex: 1, minHeight: 0, overflowY: full ? "hidden" : "auto", padding: full ? "var(--space-5) var(--space-6)" : "var(--space-6) var(--space-8) var(--space-10)" }}>
          {view === "map" && effectiveDate && <MapView route={route} date={effectiveDate} />}
          {view === "overview" && effectiveDate && <Overview horizon={horizon} route={route} date={effectiveDate} />}
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
