import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { LOAD_VARS, loadStep } from "../../../../../shared/load";
import { FORECAST_HATCH } from "../hatch";
import { deviationPct, fmtPct, toneForPct } from "../../../format";

/**
 * PROTOTYPE — throwaway. Compares 4 ways to show "прогноз/факт vs норма (baseline)" on the
 * time-strip bar. Not wired to real data or the real store; synthetic 24h dataset below.
 * Reuses real tokens/helpers (LOAD_VARS, FORECAST_HATCH, toneForPct/deviationPct/fmtPct) so a
 * winning variant can be lifted into Bars.tsx with minimal translation.
 *
 * See docs/research/time-strip-deviation-viz.md for the design research behind variants A-C.
 * Route: /#/prototype/time-strip?variant=A|B|C|D — dev-only, see App.tsx.
 */

const NOW_INDEX = 14;
const baseline = [120, 90, 70, 60, 70, 120, 300, 650, 800, 500, 420, 450, 470, 460, 480, 520, 650, 820, 700, 480, 380, 300, 220, 150];
const forecast = [115, 88, 72, 58, 65, 125, 310, 680, 820, 495, 410, 445, 460, 470, 560, 700, 1050, 690, 470, 250, 295, 215, 148, 140];
const ghost = [115, 88, 72, 58, 65, 125, 310, 680, 820, 495, 410, 445, 460, 480, 520, 650, 820, 700, 480, 380, 300, 220, 150, 140];
const actual = [118, 85, 69, 55, 60, 130, 295, 910, 430, 505, 400, 455, 465, 460];

function hasActual(i: number) {
  return i < actual.length;
}
function valueAt(i: number) {
  return hasActual(i) ? actual[i] : forecast[i];
}
function hourLabel(i: number) {
  return String(i).padStart(2, "0");
}
const TONE_VAR = { ok: "var(--status-ok)", warn: "var(--status-warn)", danger: "var(--status-danger)" } as const;

const maxAbs = Math.max(...forecast, ...actual, ...ghost);

const VARIANTS = [
  { key: "A", num: 1, name: "Вверх-вниз от нормы" },
  { key: "B", num: 2, name: "Чёрточка нормы на столбике" },
  { key: "C", num: 3, name: "Отдельная полоска под столбиками" },
  { key: "D", num: 4, name: "Коридор нормы (экспериментально)" },
] as const;
type VariantKey = (typeof VARIANTS)[number]["key"];

function GhostOutline({ style }: { style: React.CSSProperties }) {
  return <div className="pointer-events-none absolute inset-x-0 rounded-t-xs border border-b-0 border-dashed border-text-secondary/50" style={style} />;
}

function NowLine() {
  return <div className="pointer-events-none absolute top-0 h-full w-px bg-text-primary" style={{ left: `${(NOW_INDEX / 24) * 100}%` }} />;
}

function HourAxis() {
  return (
    <div className="mt-1.5 grid gap-0.5" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
      {Array.from({ length: 24 }, (_, i) => (
        <span key={i} className="text-center text-mono-s text-text-muted">{hourLabel(i)}</span>
      ))}
    </div>
  );
}

function VariantA() {
  const devs = baseline.map((b, i) => valueAt(i) - b);
  const gDevs = baseline.map((b, i) => ghost[i] - b);
  const maxDev = Math.max(...devs.map(Math.abs), ...gDevs.map(Math.abs)) * 1.1;
  return (
    <div className="relative">
      <div className="relative grid h-40 items-center gap-0.5" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-white/15" />
        {Array.from({ length: 24 }, (_, i) => {
          const dev = devs[i];
          const pct = deviationPct(valueAt(i), baseline[i]);
          const tone = toneForPct(pct);
          const h = (Math.abs(dev) / maxDev) * 50;
          const gDev = gDevs[i];
          const gh = (Math.abs(gDev) / maxDev) * 50;
          const showGhost = !hasActual(i) && Math.abs(gDev - dev) > 1;
          return (
            <div key={i} className="relative h-full">
              <div
                className={hasActual(i) ? "absolute w-full" : "absolute w-full"}
                style={{
                  height: `${h}%`,
                  background: TONE_VAR[tone],
                  backgroundImage: hasActual(i) ? undefined : FORECAST_HATCH,
                  ...(dev >= 0
                    ? { bottom: "50%", borderRadius: "3px 3px 0 0" }
                    : { top: "50%", borderRadius: "0 0 3px 3px" }),
                }}
              />
              {showGhost && (
                <GhostOutline
                  style={
                    gDev >= 0
                      ? { bottom: "50%", height: `${gh}%`, borderRadius: "3px 3px 0 0" }
                      : { top: "50%", height: `${gh}%`, borderRadius: "0 0 3px 3px" }
                  }
                />
              )}
            </div>
          );
        })}
        <NowLine />
      </div>
      <HourAxis />
    </div>
  );
}

function VariantB() {
  return (
    <div className="relative">
      <div className="relative grid h-40 items-end gap-0.5" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
        {Array.from({ length: 24 }, (_, i) => {
          const v = valueAt(i);
          const ratio = v / maxAbs;
          const hPct = (v / (maxAbs * 1.1)) * 100;
          const basePct = (baseline[i] / (maxAbs * 1.1)) * 100;
          const g = ghost[i];
          const gPct = (g / (maxAbs * 1.1)) * 100;
          const showGhost = !hasActual(i) && Math.abs(g - v) > 1;
          return (
            <div key={i} className="relative h-full">
              <div className="absolute -inset-x-0.5 h-0.5 rounded-xs bg-text-primary/80" style={{ bottom: `${basePct}%` }} />
              {showGhost && <GhostOutline style={{ bottom: 0, height: `${gPct}%` }} />}
              <div
                className="absolute bottom-0 w-full rounded-t-xs"
                style={{
                  height: `${hPct}%`,
                  minHeight: v > 0 ? 2 : 0,
                  backgroundColor: LOAD_VARS[loadStep(ratio)],
                  backgroundImage: hasActual(i) ? undefined : FORECAST_HATCH,
                }}
              />
            </div>
          );
        })}
        <NowLine />
      </div>
      <HourAxis />
    </div>
  );
}

function VariantC() {
  return (
    <div className="relative">
      <div className="relative grid h-40 items-end gap-0.5" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
        {Array.from({ length: 24 }, (_, i) => {
          const v = valueAt(i);
          const ratio = v / maxAbs;
          const hPct = (v / (maxAbs * 1.1)) * 100;
          const g = ghost[i];
          const gPct = (g / (maxAbs * 1.1)) * 100;
          const showGhost = !hasActual(i) && Math.abs(g - v) > 1;
          return (
            <div key={i} className="relative h-full">
              {showGhost && <GhostOutline style={{ bottom: 0, height: `${gPct}%` }} />}
              <div
                className="absolute bottom-0 w-full rounded-t-xs"
                style={{
                  height: `${hPct}%`,
                  minHeight: v > 0 ? 2 : 0,
                  backgroundColor: LOAD_VARS[loadStep(ratio)],
                  backgroundImage: hasActual(i) ? undefined : FORECAST_HATCH,
                }}
              />
            </div>
          );
        })}
        <NowLine />
      </div>
      <HourAxis />
      <div className="mt-1.5 grid gap-0.5" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
        {Array.from({ length: 24 }, (_, i) => {
          const pct = deviationPct(valueAt(i), baseline[i]);
          return <div key={i} className="h-1 rounded-xs" style={{ background: TONE_VAR[toneForPct(pct)] }} />;
        })}
      </div>
    </div>
  );
}

// The "ok" threshold in toneForPct is ±15% — reused here as the corridor width, so "inside the
// band" in this variant means exactly the same thing as "green" in every other variant.
const CORRIDOR_TOLERANCE = 0.15;

/**
 * Experimental — adapts the "band around trend" pattern (Datadog Anomaly Monitor, New Relic
 * baseline+prediction band) from continuous line charts to discrete per-hour bars. The research
 * (docs/research/time-strip-deviation-viz.md) found this pattern documented only for lines, not
 * bars — this is us trying it anyway, not a validated precedent like variant A.
 */
function VariantBand() {
  return (
    <div className="relative">
      <div className="relative grid h-40 items-end gap-0.5" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
        {Array.from({ length: 24 }, (_, i) => {
          const v = valueAt(i);
          const ratio = v / maxAbs;
          const hPct = (v / (maxAbs * 1.1)) * 100;
          const g = ghost[i];
          const gPct = (g / (maxAbs * 1.1)) * 100;
          const showGhost = !hasActual(i) && Math.abs(g - v) > 1;
          const bandLowPct = ((baseline[i] * (1 - CORRIDOR_TOLERANCE)) / (maxAbs * 1.1)) * 100;
          const bandHighPct = ((baseline[i] * (1 + CORRIDOR_TOLERANCE)) / (maxAbs * 1.1)) * 100;
          const outside = Math.abs(deviationPct(v, baseline[i])) > CORRIDOR_TOLERANCE * 100;
          return (
            <div key={i} className="relative h-full">
              <div
                className="absolute w-full rounded-xs bg-white/10"
                style={{ bottom: `${bandLowPct}%`, height: `${bandHighPct - bandLowPct}%` }}
              />
              {showGhost && <GhostOutline style={{ bottom: 0, height: `${gPct}%` }} />}
              <div
                className="absolute bottom-0 w-full rounded-t-xs"
                style={{
                  height: `${hPct}%`,
                  minHeight: v > 0 ? 2 : 0,
                  backgroundColor: outside ? TONE_VAR[toneForPct(deviationPct(v, baseline[i]))] : LOAD_VARS[loadStep(ratio)],
                  backgroundImage: hasActual(i) ? undefined : FORECAST_HATCH,
                }}
              />
            </div>
          );
        })}
        <NowLine />
      </div>
      <HourAxis />
    </div>
  );
}

const RENDER: Record<VariantKey, () => React.JSX.Element> = { A: VariantA, B: VariantB, C: VariantC, D: VariantBand };

const DESCRIPTIONS: Record<VariantKey, { title: string; body: string }> = {
  A: {
    title: "Столбики растут вверх или вниз от обычного уровня",
    body: "Средняя линия — «как обычно бывает в этот час». Выше — трамваи переполнены сильнее обычного, ниже — пассажиров меньше, чем всегда. Цвет — насколько это серьёзно. Штриховка — час ещё не наступил, это прогноз. Пунктир — прогноз без ручных поправок диспетчера. Официально задокументированный паттерн (FT Visual Vocabulary, «Diverging bar») — см. docs/research/time-strip-deviation-viz.md.",
  },
  B: {
    title: "Как сейчас, плюс чёрточка «обычный уровень»",
    body: "Столбики без изменений. Белая чёрточка на каждом столбике — сколько обычно бывает в этот час; столбик выше чёрточки — людей больше, чем всегда.",
  },
  C: {
    title: "Как сейчас, плюс отдельная полоска под столбиками",
    body: "Столбики вообще не меняются. Под ними — узкая цветная полоска на каждый час, отвечающая только за «насколько отличается от обычного», отдельно от «сколько людей».",
  },
  D: {
    title: "Экспериментальный: полупрозрачный «коридор нормы» позади столбика",
    body: "Серая область позади каждого столбика — диапазон ±15% от обычного уровня. Если столбик торчит выше или ниже коридора — цвет переключается на «насколько это серьёзно», не на загрузку. Внимание: этот паттерн в других продуктах задокументирован только для непрерывных линий (Datadog Anomaly Monitor, New Relic), не для дискретных столбиков по часам — здесь мы пробуем перенести его на бары без подтверждённого прецедента, в отличие от варианта 1.",
  },
};

export default function TimeStripVariantsPrototype() {
  const [params, setParams] = useSearchParams();
  const current = (params.get("variant") as VariantKey) ?? "A";
  const idx = Math.max(0, VARIANTS.findIndex((v) => v.key === current));
  const variant = VARIANTS[idx] ?? VARIANTS[0];
  const Render = RENDER[variant.key];

  const go = (delta: number) => {
    const next = VARIANTS[(idx + delta + VARIANTS.length) % VARIANTS.length];
    setParams({ variant: next.key });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || (e.target as HTMLElement | null)?.isContentEditable) return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  return (
    <div className="min-h-screen bg-bg-page px-6 py-8 text-text-primary" style={{ paddingBottom: "6rem" }}>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-h3 font-bold">Прототип: полоса времени — 4 варианта</h1>
        <p className="mt-1 text-body-s text-text-muted">
          Черновик для обсуждения, не готовый экран. Цифры выдуманные — 24 часа одного дня, сейчас 14:00
          (после этой отметки — ещё не наступившее время, дальше только прогноз).
        </p>

        <div className="mt-6 rounded-md bg-bg-surface p-5 shadow-(--inset-hairline)">
          <div className="mt-eyebrow">Вариант {variant.num}</div>
          <div className="mt-1 text-body-s font-semibold text-text-primary">{DESCRIPTIONS[variant.key].title}</div>
          <p className="mt-1 max-w-xl text-body-s text-text-muted">{DESCRIPTIONS[variant.key].body}</p>

          <div className="mt-6">
            <Render />
          </div>

          <div className="mt-5 flex flex-wrap gap-4 text-caption text-text-muted">
            {variant.key === "A" && (
              <>
                <LegendDot color={TONE_VAR.ok} label="обычная загрузка" />
                <LegendDot color={TONE_VAR.warn} label="заметно отличается от обычного" />
                <LegendDot color={TONE_VAR.danger} label="сильно отличается от обычного" />
              </>
            )}
            {variant.key !== "A" && (
              <>
                <LegendDot color={LOAD_VARS[0]} label="Свободно" />
                <LegendDot color={LOAD_VARS[2]} label="Умеренно" />
                <LegendDot color={LOAD_VARS[4]} label="Перегружено" />
              </>
            )}
            {variant.key === "C" && <LegendDot color={TONE_VAR.danger} label="сильно отличается от обычного (полоска)" />}
            {variant.key === "D" && (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-xs bg-white/10" />
                  коридор нормы (±15%)
                </span>
                <LegendDot color={TONE_VAR.danger} label="столбик вылез за коридор" />
              </>
            )}
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-xs" style={{ backgroundColor: "var(--bg-surface-2)", backgroundImage: FORECAST_HATCH }} />
              ещё не наступило — это прогноз
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0 w-4 border-t border-dashed border-text-secondary/70" />
              прогноз без ручных поправок диспетчера
            </span>
          </div>
        </div>

        <p className="mt-3 text-caption text-text-muted">Сравнение и рекомендации: docs/research/time-strip-deviation-viz.md</p>
      </div>

      <div className="fixed bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-bg-elevated px-3.5 py-2 shadow-md">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Предыдущий вариант"
          className="flex size-8 items-center justify-center rounded-full bg-bg-surface-2 text-text-primary hover:bg-bg-surface"
        >
          ‹
        </button>
        <span className="min-w-56 text-center text-ui-s">
          Вариант {variant.num} <span className="text-text-secondary">— {variant.name}</span>
        </span>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Следующий вариант"
          className="flex size-8 items-center justify-center rounded-full bg-bg-surface-2 text-text-primary hover:bg-bg-surface"
        >
          ›
        </button>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-2.5 rounded-xs" style={{ background: color }} />
      {label}
    </span>
  );
}
