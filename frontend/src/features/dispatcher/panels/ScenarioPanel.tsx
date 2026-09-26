import { Button, Card } from "../../../components";
import { isDefaultCorrections } from "../../../api/hooks";
import { useDispatcher, type CorrectionKey } from "../store";
import { useCurrentSeries, useFocusIndex, useScenarioActive, useUncorrectedSeries } from "../forecast";
import { SCALE_UNITS, pointLabel } from "../time";
import { deviationPct, fmtInt, fmtPct, fmtSigned } from "../format";
import { ScenarioSlider } from "./scenario/ScenarioSlider";

const ROWS: { key: CorrectionKey; label: string }[] = [
  { key: "weather", label: "Погода" },
  { key: "event", label: "Событие" },
  { key: "season", label: "Сезон" },
];

/** Correction coefficients (weather / event / season) and their effect on the focused forecast. */
export function ScenarioPanel() {
  const corrections = useDispatcher((s) => s.corrections);
  const scale = useDispatcher((s) => s.scale);
  const setCorrection = useDispatcher((s) => s.setCorrection);
  const resetCorrections = useDispatcher((s) => s.resetCorrections);
  const active = useScenarioActive();

  const current = useCurrentSeries();
  const baseline = useUncorrectedSeries();
  const focus = useFocusIndex(current.points);
  const point = current.points[focus];
  const basePoint = baseline.points[focus];

  const canShowResult = active && point && basePoint;

  return (
    <Card tone="glass" padding="var(--space-4)" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="mt-eyebrow">Сценарий</div>
        <Button
          variant="ghost"
          size="sm"
          disabled={isDefaultCorrections(corrections)}
          onClick={() => resetCorrections()}
        >
          Сбросить
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {ROWS.map(({ key, label }) => (
          <ScenarioSlider
            key={key}
            label={label}
            value={corrections[key]}
            onCommit={(v) => setCorrection(key, v)}
          />
        ))}
      </div>

      <div className="border-t border-t-border-subtle pt-3">
        {!active ? (
          <span className="text-caption text-text-muted">
            Сдвиньте ползунок, чтобы увидеть, как поправка меняет прогноз.
          </span>
        ) : !canShowResult ? (
          <span className="text-caption text-text-muted">Загрузка…</span>
        ) : (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-ui-s text-text-secondary">В фокусе</span>
              <span className="text-ui-s text-text-primary tabular-nums">
                {fmtInt(basePoint.forecast)} → {fmtInt(point.forecast)} {SCALE_UNITS[scale]}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-ui-s text-text-secondary">Изменение</span>
              <span className="text-ui-s text-text-primary tabular-nums">
                {fmtSigned(point.forecast - basePoint.forecast)} ·{" "}
                {fmtPct(deviationPct(point.forecast, basePoint.forecast))}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-caption text-text-muted">{pointLabel(scale, point.periodStart)}</span>
              {current.isFetching && <span className="text-caption text-text-muted">пересчёт…</span>}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
