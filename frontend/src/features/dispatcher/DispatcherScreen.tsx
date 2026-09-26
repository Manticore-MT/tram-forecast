import React from "react";
import { Floating } from "../../shared/Floating";
import { ErrorNotice, LoadingNotice } from "../../shared/notices";
import { useMeta } from "../../api/hooks";
import { useInitClock } from "./forecast";
import { DispatcherMap } from "./map/DispatcherMap";
import type { MapHandle } from "./map/MapCanvas";
import { MapZoomControls } from "./map/MapZoomControls";
import { AttentionPanel } from "./panels/AttentionPanel";
import { DetailsPanel } from "./panels/DetailsPanel";
import { PlaceBreadcrumbs } from "./panels/PlaceBreadcrumbs";
import { ScenarioPanel } from "./panels/ScenarioPanel";
import { TimeStrip } from "./panels/TimeStrip";

/** Экран диспетчера: карта на весь экран и плавающие панели поверх неё.
 *  Что выбрано (объект, время, сценарий) — в store.ts; данные — через хуки forecast.ts. */
export function DispatcherScreen() {
  const ready = useInitClock();
  const meta = useMeta();
  const map = React.useRef<MapHandle>(null);
  if (!ready) {
    return (
      <div className="grid h-full min-h-155 place-items-center rounded-xl">
        {meta.isError ? <ErrorNotice error={meta.error} /> : <LoadingNotice />}
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-155 overflow-hidden rounded-xl">
      <DispatcherMap ref={map} />
      <Floating anchor="top" className="flex-row items-center">
        <PlaceBreadcrumbs />
        <MapZoomControls map={map} />
      </Floating>
      <Floating anchor="left" className="w-75">
        <AttentionPanel />
        <ScenarioPanel />
      </Floating>
      <Floating anchor="right" className="w-80">
        <DetailsPanel />
      </Floating>
      <Floating anchor="bottom">
        <TimeStrip />
      </Floating>
    </div>
  );
}
