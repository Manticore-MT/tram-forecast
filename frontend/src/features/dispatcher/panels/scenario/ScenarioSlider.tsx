import React from "react";
import { Icon, Input } from "../../../../components";
import { clampValue, parseValueInput, posToValue, roundValue, SLIDER_MAX, valueToPos } from "./sliderMath";

const DEBOUNCE_MS = 300;

export interface ScenarioSliderProps {
  label: string;
  value: number;
  onCommit: (value: number) => void;
}

/** One correction row: label, centered piecewise-linear slider (1.0 at the middle), and a
 *  typable number field. Dragging stays local; the store (and thus the API) only hears the
 *  debounced or released value, so scrubbing doesn't flood requests. */
export function ScenarioSlider({ label, value, onCommit }: ScenarioSliderProps) {
  const [local, setLocal] = React.useState(value);
  const [text, setText] = React.useState(() => local.toFixed(2));
  const timer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    setLocal(value);
    setText(value.toFixed(2));
  }, [value]);

  const scheduleCommit = (next: number) => {
    setLocal(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onCommit(next), DEBOUNCE_MS);
  };

  const commitNow = (next: number) => {
    window.clearTimeout(timer.current);
    setLocal(next);
    onCommit(next);
  };

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleTextCommit = () => {
    const parsed = parseValueInput(text);
    if (parsed === null) {
      setText(local.toFixed(2));
      return;
    }
    setText(parsed.toFixed(2));
    commitNow(parsed);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-ui-s text-text-secondary">{label}</span>
      <div className="relative flex-1">
        <div
          className="pointer-events-none absolute top-1/2 h-2.5 w-px -translate-x-1/2 -translate-y-1/2 bg-border-strong"
          style={{ left: "50%" }}
        />
        <input
          type="range"
          min={0}
          max={SLIDER_MAX}
          step={1}
          value={valueToPos(local)}
          onChange={(e) => scheduleCommit(posToValue(Number(e.target.value)))}
          onPointerUp={() => commitNow(local)}
          onKeyDown={(e) => {
            // Native range stepping works in pos-space (uneven near 1.0); step the value itself instead.
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              scheduleCommit(roundValue(clampValue(local - 0.05)));
            } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              scheduleCommit(roundValue(clampValue(local + 0.05)));
            }
          }}
          onKeyUp={(e) => {
            if (e.key.startsWith("Arrow")) commitNow(local);
          }}
          className="w-full"
          aria-label={label}
        />
      </div>
      <span aria-hidden="true" className="shrink-0 select-none text-ui-s text-text-muted">×</span>
      <Input
        size="sm"
        align="right"
        type="text"
        inputMode="decimal"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleTextCommit}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        style={{ width: "4rem", flexShrink: 0 }}
      />
      <button
        type="button"
        aria-label={`Сбросить «${label}» к 1.00`}
        title="Сбросить к 1.00"
        disabled={value === 1}
        onClick={() => commitNow(1)}
        className="flex size-7 shrink-0 items-center justify-center rounded-sm text-text-secondary outline-none hover:bg-glass-fill hover:text-text-primary disabled:pointer-events-none disabled:opacity-40 focus-visible:shadow-[inset_0_0_0_2px_var(--focus-ring)]"
      >
        <Icon name="refresh-cw" size={14} />
      </button>
    </div>
  );
}
