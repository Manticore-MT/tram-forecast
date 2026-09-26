const HATCH = "repeating-linear-gradient(135deg, rgba(0,0,0,0.35) 0 2px, transparent 2px 4px)";

function Item({ swatch, label }: { swatch: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-caption text-text-muted">
      {swatch}
      {label}
    </span>
  );
}

/** What the bar styles mean: fill = fact, hatch = forecast, dashed outline = forecast without the scenario. */
export function StripLegend({ hasActual, showGhost }: { hasActual: boolean; showGhost: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {hasActual && <Item swatch={<span className="size-2.5 rounded-xs bg-text-secondary" />} label="факт" />}
      <Item swatch={<span className="size-2.5 rounded-xs bg-text-secondary" style={{ backgroundImage: HATCH }} />} label="прогноз" />
      {showGhost && <Item swatch={<span className="size-2.5 rounded-xs border border-dashed border-text-secondary" />} label="без поправок" />}
    </div>
  );
}
