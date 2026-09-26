import type { ReactNode } from "react";
import { Card } from "../components";

export interface PanelProps {
  title?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
}

/** Titled surface card for the grid-style Overview screen. */
export function Panel({ title, action, children }: PanelProps) {
  return (
    <Card tone="surface" padding="var(--space-6)" className="flex flex-col gap-5">
      {(title || action) && (
        <div className="flex items-center justify-between gap-4">
          <div className="text-h4">{title}</div>
          {action}
        </div>
      )}
      {children}
    </Card>
  );
}
