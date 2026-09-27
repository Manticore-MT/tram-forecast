import { cn } from "@/lib/utils";
import { Badge, Tooltip } from "../../../components";
import type { useModelStats } from "../../../api/hooks";
import { Panel } from "../../../shared/Panel";
import { Empty, QueryGate } from "./QueryGate";

const DAY = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", timeZone: "UTC" });

function dayLabel(date: string | undefined): string {
  if (!date) return "";
  const t = Date.parse(`${date.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(t) ? date : DAY.format(t);
}

/** Smallest "round" step (1/2/5 × 10^k) at or above `rough`, so axis ticks read as 5/10/20 % rather
 *  than an arbitrary fraction of the tallest bar. */
function niceStep(rough: number): number {
  if (rough <= 0) return 1;
  const exp = Math.floor(Math.log10(rough));
  const base = Math.pow(10, exp);
  const norm = rough / base;
  const niceNorm = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return niceNorm * base;
}

/** WAPE per day: a bar per day, lower is better. */
export function QualityHistory({ stats }: { stats: ReturnType<typeof useModelStats> }) {
  return (
    <Panel title="История качества" action={<Badge tone="neutral">WAPE по дням · 30 дней</Badge>}>
      <QueryGate q={stats}>
        {() => {
          const history = stats.data?.history ?? [];
          if (history.length === 0) return <Empty>История качества пока пуста</Empty>;
          const wapePct = history.map((h) => (h.wape == null ? null : h.wape * 100));
          const max = Math.max(1, ...wapePct.filter((v): v is number => v !== null));
          const paddedMax = max * 1.15;
          const step = niceStep(max / 3);
          const tickValues: number[] = [];
          for (let t = step; t <= paddedMax; t += step) tickValues.push(t);
          const fmtTick = (v: number) => (step < 1 ? v.toFixed(1) : v.toFixed(0));
          const n = history.length;
          const ticks = new Set([0, Math.floor((n - 1) / 2), n - 1]);
          return (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <div className="relative h-28 w-8 shrink-0">
                  {tickValues.map((t) => (
                    <span
                      key={t}
                      className="absolute right-0 -translate-y-1/2 text-mono-s text-text-muted"
                      style={{ top: `${100 - (t / paddedMax) * 100}%` }}
                    >
                      {fmtTick(t)} %
                    </span>
                  ))}
                  <span className="absolute right-0 bottom-0 translate-y-1/2 text-mono-s text-text-muted">0 %</span>
                </div>
                <div className="relative h-28 flex-1">
                  {tickValues.map((t) => (
                    <div
                      key={t}
                      className="pointer-events-none absolute inset-x-0 border-t border-border-subtle"
                      style={{ top: `${100 - (t / paddedMax) * 100}%` }}
                    />
                  ))}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-border-default" />
                  <div
                    role="img"
                    aria-label="WAPE прогноза по дням за последние 30 дней"
                    className="absolute inset-0 grid items-end gap-0.5"
                    style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
                  >
                    {history.map((h, i) => {
                      const pct = wapePct[i];
                      return (
                        <Tooltip
                          key={h.date ?? i}
                          style={{ display: "flex", alignItems: "flex-end", height: "100%" }}
                          content={`${dayLabel(h.date)} · WAPE ${pct?.toFixed(1) ?? "—"} % · оценка ${h.wapeScore?.toFixed(2) ?? "—"}`}
                        >
                          <div
                            className={cn("w-full rounded-t-xs", pct === null ? "bg-text-muted/20" : "bg-cyan-500/70 hover:bg-cyan-500")}
                            style={{ height: pct === null ? "4%" : `${(pct / paddedMax) * 100}%`, minHeight: pct ? 2 : 0 }}
                          />
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-8 shrink-0" />
                <div className="grid flex-1" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
                  {history.map((h, i) => (
                    <span
                      key={h.date ?? i}
                      className={cn("flex whitespace-nowrap text-caption text-text-muted", i === n - 1 ? "justify-end" : i > 0 && "justify-center")}
                    >
                      {ticks.has(i) ? dayLabel(h.date) : ""}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-caption text-text-muted">Чем ниже столбец, тем точнее был прогноз в этот день. Наведите на столбец, чтобы увидеть значение.</span>
            </div>
          );
        }}
      </QueryGate>
    </Panel>
  );
}
