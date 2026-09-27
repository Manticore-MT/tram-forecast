import React from "react";
import { cn } from "@/lib/utils";
import { Checkbox, Icon, Input } from "../../../components";
import { useRoutes, type CommonParams } from "../../../api/hooks";
import type { useAttention } from "../../../api/hooks";
import { ErrorNotice } from "../../../shared/notices";
import { Panel } from "../../../shared/Panel";
import { LOAD_HEX, LoadLegend, loadStep } from "../../../shared/load";
import { MapCanvas } from "../map/MapCanvas";
import { zonesFromAttention } from "../panels/AttentionPanel";
import { DeviationList } from "../shared";
import { useDispatcher } from "../store";
import { SCALE_UNITS, addDays, addMonths, pointLabel, windowLabel, type Scale } from "../time";
import { deviationPct, fmtInt, fmtPct, fmtSigned, toneForPct } from "../format";
import { LineChart, LineLegend, type LineSeries } from "./LineChart";
import { comparisonCursor, networkPoints, openRoute, peakIndex, routeTotals, withinForecastRange } from "./network";
import { Empty, QueryGate, TONE_TEXT } from "./QueryGate";

type RoutesQuery = ReturnType<typeof useRoutes>;

const TONE_BG = { ok: "bg-status-ok", warn: "bg-status-warn", danger: "bg-status-danger" } as const;

export interface DynamicsPanelProps {
  network: RoutesQuery;
  scale: Scale;
  cursor: string;
  /** Same window params `network` was fetched with (scenario corrections included) — comparison
   *  lines reuse them, only the date moves. */
  params: CommonParams | undefined;
}

const COMPARE_COLORS = { weekAgo: "var(--cyan-500)", monthAgo: "var(--text-secondary)", custom: "var(--status-warn)" } as const;

export function DynamicsPanel({ network, scale, cursor, params }: DynamicsPanelProps) {
  const latestDate = useDispatcher((s) => s.latestDate);
  const forecastFrom = useDispatcher((s) => s.forecastFrom);
  const [showWeekAgo, setShowWeekAgo] = React.useState(false);
  const [showMonthAgo, setShowMonthAgo] = React.useState(false);
  const [showCustom, setShowCustom] = React.useState(false);

  // "Неделю назад" reuses the same "-1 window" shift already used elsewhere (comparisonCursor's
  // "period" mode). "Месяц назад" on the day scale is 4 недели (28 дней), not a calendar month —
  // that keeps it on the same day of the week, which matters far more for traffic than landing on
  // the same day-of-month. Week/month/year scales don't have a "day of week" to match, so those
  // keep the calendar-month shift.
  const weekAgoDate = comparisonCursor(scale, cursor, "period");
  const monthAgoDate = scale === "day" ? addDays(cursor, -28) : addMonths(cursor, -1);
  // Prefilled so the date field is never blank when the checkbox is switched on — "2 месяца назад"
  // is just a starting point distinct from the two fixed presets above, not a meaningful default.
  const [customDate, setCustomDate] = React.useState(() => addMonths(cursor, -2));

  const weekAgoInRange = withinForecastRange(weekAgoDate, forecastFrom, latestDate);
  const monthAgoInRange = withinForecastRange(monthAgoDate, forecastFrom, latestDate);
  const weekAgo = useRoutes(showWeekAgo && weekAgoInRange && params ? { ...params, date: weekAgoDate } : undefined);
  const monthAgo = useRoutes(showMonthAgo && monthAgoInRange && params ? { ...params, date: monthAgoDate } : undefined);
  const custom = useRoutes(showCustom && params ? { ...params, date: customDate } : undefined);

  const points = networkPoints(network.data?.routes ?? []);
  const series: LineSeries[] = [
    { label: "прогноз", values: points.map((p) => p.forecast), color: "var(--brand-accent)" },
    { label: "базовый уровень", values: points.map((p) => p.baseline), color: "var(--text-muted)", quiet: true },
  ];
  let anyCompareError = false;
  if (showWeekAgo) {
    const before = networkPoints(weekAgo.data?.routes ?? []);
    if (before.length > 0) series.push({ label: windowLabel(scale, weekAgoDate), values: before.map((p) => p.forecast), color: COMPARE_COLORS.weekAgo, dashed: true, quiet: true });
    anyCompareError ||= weekAgo.isError;
  }
  if (showMonthAgo) {
    const before = networkPoints(monthAgo.data?.routes ?? []);
    if (before.length > 0) series.push({ label: windowLabel(scale, monthAgoDate), values: before.map((p) => p.forecast), color: COMPARE_COLORS.monthAgo, dashed: true, quiet: true });
    anyCompareError ||= monthAgo.isError;
  }
  if (showCustom) {
    const before = networkPoints(custom.data?.routes ?? []);
    if (before.length > 0) series.push({ label: windowLabel(scale, customDate), values: before.map((p) => p.forecast), color: COMPARE_COLORS.custom, dashed: true, quiet: true });
    anyCompareError ||= custom.isError;
  }
  const peak = peakIndex(points);

  return (
    <Panel
      title="Динамика по сети"
      action={
        <div className="flex flex-wrap items-center gap-4">
          <Checkbox label="Неделю назад" checked={showWeekAgo} onChange={(e) => setShowWeekAgo(e.target.checked)} />
          <Checkbox label="Месяц назад" checked={showMonthAgo} onChange={(e) => setShowMonthAgo(e.target.checked)} />
          <Checkbox label="Своя дата" checked={showCustom} onChange={(e) => setShowCustom(e.target.checked)} />
          {showCustom && (
            <Input
              size="sm"
              type="date"
              aria-label="Своя дата для сравнения"
              value={customDate}
              max={latestDate ?? undefined}
              min={forecastFrom ?? undefined}
              onChange={(e) => setCustomDate(e.target.value)}
            />
          )}
        </div>
      }
    >
      <QueryGate q={network}>
        {() => points.length === 0 ? <Empty>Нет прогноза по маршрутам за этот период</Empty> : (
          <>
            <LineLegend series={series} />
            <LineChart
              ariaLabel="Прогноз пассажиропотока по сети за период, с выбранными сравнениями"
              series={series}
              labels={points.map((p) => pointLabel(scale, p.periodStart))}
              marker={peak >= 0 ? {
                index: peak,
                value: points[peak].forecast,
                label: `пик ${pointLabel(scale, points[peak].periodStart)} · ${fmtInt(points[peak].forecast)} ${SCALE_UNITS[scale]}`,
              } : undefined}
            />
            {anyCompareError && <Empty>Один из периодов сравнения не загрузился — его линия скрыта</Empty>}
          </>
        )}
      </QueryGate>
    </Panel>
  );
}

export function DemandMapPanel({ network }: { network: RoutesQuery }) {
  const routes = network.data?.routes;
  const { colors, values } = React.useMemo(() => {
    const totals = routeTotals(routes ?? []);
    const max = Math.max(1, ...totals.map((t) => t.forecast));
    return {
      colors: Object.fromEntries(totals.map((t) => [t.routeId, LOAD_HEX[loadStep(t.forecast / max)]])),
      values: Object.fromEntries(totals.map((t) => [t.routeId, t.forecast])),
    };
  }, [routes]);

  return (
    <Panel title="Карта спроса">
      <MapCanvas
        place={{ level: "network" }}
        routeColors={colors}
        routeValues={values}
        onRouteClick={openRoute}
        className="min-h-72 flex-1 rounded-lg shadow-(--inset-hairline)"
      />
      {network.isError ? <ErrorNotice error={network.error} onRetry={() => void network.refetch()} /> : (
        <div className="flex flex-col gap-2">
          <LoadLegend />
          <span className="text-caption text-text-muted">Прогноз за период относительно самого загруженного маршрута. Нажмите на линию, чтобы открыть маршрут.</span>
        </div>
      )}
    </Panel>
  );
}

const TOP_ROUTES = 8;

export function TopRoutesPanel({ network }: { network: RoutesQuery }) {
  return (
    <Panel title="Топ маршрутов по отклонению" action={<span className="inline-flex items-center rounded-pill bg-glass-fill px-2.5 py-1 text-ui-s leading-none text-text-secondary">к базовому уровню</span>}>
      <QueryGate q={network}>
        {() => {
          const rows = routeTotals(network.data?.routes ?? [])
            .map((t) => ({ ...t, pct: deviationPct(t.forecast, t.baseline) }))
            .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))
            .slice(0, TOP_ROUTES);
          if (rows.length === 0) return <Empty>Нет маршрутов</Empty>;
          const span = Math.max(10, ...rows.map((r) => Math.abs(r.pct)));
          return (
            <div className="flex flex-col">
              {rows.map((r) => {
                const tone = toneForPct(r.pct);
                const width = (Math.abs(r.pct) / span) * 50;
                return (
                  <button
                    key={r.routeId}
                    type="button"
                    onClick={() => openRoute(r.routeId)}
                    title="Открыть маршрут на карте диспетчера"
                    className="grid grid-cols-[4.5rem_minmax(0,1fr)_4.5rem_5.5rem] items-center gap-3 rounded-sm px-2 py-2.5 text-left outline-none transition-ui hover:bg-glass-fill focus-visible:shadow-[inset_0_0_0_2px_var(--focus-ring)]"
                  >
                    <span className="inline-flex items-center gap-1.5 text-ui-s text-text-primary">
                      <Icon name="tram-front" size={14} />№ {r.routeId}
                    </span>
                    <span className="relative h-2 rounded-xs bg-bg-surface-2">
                      <span className="absolute inset-y-0 left-1/2 w-px bg-border-strong" />
                      <span
                        className={cn("absolute inset-y-0 rounded-xs", TONE_BG[tone])}
                        style={r.pct >= 0 ? { left: "50%", width: `${width}%` } : { left: `${50 - width}%`, width: `${width}%` }}
                      />
                    </span>
                    <span className={cn("text-right text-mono-s", TONE_TEXT[tone])}>{fmtPct(r.pct)}</span>
                    <span className="text-right text-mono-s text-text-muted">{fmtSigned(r.forecast - r.baseline)}</span>
                  </button>
                );
              })}
            </div>
          );
        }}
      </QueryGate>
    </Panel>
  );
}

export function AttentionRatingPanel({ attention, scale }: { attention: ReturnType<typeof useAttention>; scale: Scale }) {
  return (
    <Panel title="Рейтинг зон внимания">
      <QueryGate q={attention}>
        {() => {
          const zones = attention.data?.zones ?? [];
          if (zones.length === 0) return <Empty>Зон с заметным отклонением нет</Empty>;
          const items = zonesFromAttention(zones, scale, 5);
          return (
            <DeviationList
              title={`${items.length} из ${zones.length} · по отклонению`}
              items={items}
              onSelect={(place) => { if (place.level !== "network") openRoute(place.routeId); }}
            />
          );
        }}
      </QueryGate>
    </Panel>
  );
}
