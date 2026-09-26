import React from "react";
import { Card } from "../../../components";
import { LoadLegend } from "../../../shared/load";
import { ErrorNotice, LoadingNotice } from "../../../shared/notices";
import { useDispatcher } from "../store";
import { useCurrentSeries, useScenarioActive, useUncorrectedSeries } from "../forecast";
import { Bars } from "./timeStrip/Bars";
import { Readout } from "./timeStrip/Readout";
import { StripHeader } from "./timeStrip/StripHeader";

const INTERACTIVE = "button, input, a, label, [role='slider'], [role='tablist']";

/** Time control: scale, cursor date and the focused point of the window. */
export function TimeStrip() {
  const scaleUp = useDispatcher((s) => s.scaleUp);
  const series = useCurrentSeries();
  const uncorrected = useUncorrectedSeries();
  const scenario = useScenarioActive();
  const ghost = scenario && uncorrected.points.length === series.points.length ? uncorrected.points : null;

  // Like a click on empty map: a click on the strip's background goes up one scale.
  const onBackgroundClick = (e: React.MouseEvent) => {
    if (!(e.target as Element).closest(INTERACTIVE)) scaleUp();
  };

  return (
    <Card tone="glass" padding="var(--space-3) var(--space-4)" className="flex flex-col gap-1.5" onClick={onBackgroundClick}>
      <StripHeader />
      <div className="h-18">
        {series.error ? (
          <div className="flex h-full items-center"><ErrorNotice error={series.error} /></div>
        ) : series.isLoading ? (
          <div className="flex h-full items-center justify-center"><LoadingNotice /></div>
        ) : series.points.length === 0 ? (
          <div className="flex h-full items-center justify-center text-caption text-text-muted">Нет данных за этот период</div>
        ) : (
          <Bars points={series.points} ghost={ghost} dimmed={series.isFetching} />
        )}
      </div>
      <div className="flex items-center justify-between gap-4">
        <Readout points={series.points} />
        <div className="shrink-0"><LoadLegend /></div>
      </div>
    </Card>
  );
}
