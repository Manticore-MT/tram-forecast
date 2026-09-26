import { Button, Icon, IconButton, Tabs } from "../../../../components";
import { useDispatcher } from "../../store";
import { SCALES, SCALE_LABELS, shiftCursor, windowLabel, type Scale } from "../../time";

// Coarse to fine, like the breadcrumbs: deeper is to the right.
const SCALE_ITEMS = [...SCALES].reverse().map((s) => ({ value: s, label: SCALE_LABELS[s] }));

export interface StripHeaderProps {
  /** Label of the selected interval, null when none. */
  rangeLabel: string | null;
}

/** Scale switch, window navigation, the selected interval, date jump and «Сегодня». */
export function StripHeader({ rangeLabel }: StripHeaderProps) {
  const scale = useDispatcher((s) => s.scale);
  const setRange = useDispatcher((s) => s.setRange);
  const cursor = useDispatcher((s) => s.cursor);
  const today = useDispatcher((s) => s.today);
  const latestDate = useDispatcher((s) => s.latestDate);
  const setScale = useDispatcher((s) => s.setScale);
  const shift = useDispatcher((s) => s.shift);
  const setCursor = useDispatcher((s) => s.setCursor);
  const goToday = useDispatcher((s) => s.goToday);
  if (!cursor) return null;

  const canForward = !latestDate || shiftCursor(scale, cursor, 1) <= latestDate;

  return (
    <div className="flex items-center gap-4">
      <Tabs items={SCALE_ITEMS} value={scale} onChange={(v) => setScale(v as Scale)} />
      <div className="flex items-center gap-1">
        <IconButton
          variant="ghost"
          size="sm"
          label="Предыдущий период"
          icon={<Icon name="chevron-left" size={16} />}
          onClick={() => shift(-1)}
        />
        <span className="min-w-44 text-center text-ui text-text-primary">{windowLabel(scale, cursor)}</span>
        <IconButton
          variant="ghost"
          size="sm"
          label="Следующий период"
          icon={<Icon name="chevron-right" size={16} />}
          disabled={!canForward}
          onClick={() => shift(1)}
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        {rangeLabel && (
          <span className="flex h-9 items-center gap-1 rounded-md bg-status-info/15 pl-3 pr-1 text-ui-s text-text-primary">
            {rangeLabel}
            <button
              type="button"
              aria-label="Сбросить интервал"
              title="Сбросить интервал (Esc)"
              onClick={() => setRange(null)}
              className="flex size-7 items-center justify-center rounded-sm text-text-secondary outline-none hover:bg-glass-fill hover:text-text-primary focus-visible:shadow-[inset_0_0_0_2px_var(--focus-ring)]"
            >
              ×
            </button>
          </span>
        )}
        <input
          type="date"
          aria-label="Перейти к дате"
          value={cursor}
          max={latestDate ?? undefined}
          onChange={(e) => {
            const date = e.target.value;
            if (date && (!latestDate || date <= latestDate)) setCursor(date);
          }}
          className="h-9 rounded-md bg-bg-surface-2 px-3 text-ui-s text-text-primary shadow-(--inset-hairline) outline-none [color-scheme:dark] focus-visible:shadow-[inset_0_0_0_2px_var(--focus-ring)]"
        />
        <Button variant="secondary" size="sm" disabled={cursor === today} onClick={goToday}>
          Сегодня
        </Button>
      </div>
    </div>
  );
}
