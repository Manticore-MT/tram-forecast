import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Slots of the map screen: a narrow centered top bar, side columns from the top edge down to
 *  the bottom strip, and the full-width bottom strip. */
export type FloatingAnchor = "top" | "left" | "right" | "bottom";

const ANCHOR_CLASS: Record<FloatingAnchor, string> = {
  top: "top-4 left-1/2 -translate-x-1/2",
  left: "top-4 bottom-48 left-4 overflow-y-auto [scrollbar-color:var(--ink-600)_transparent] [scrollbar-width:thin]",
  right: "top-4 bottom-48 right-4 overflow-y-auto [scrollbar-color:var(--ink-600)_transparent] [scrollbar-width:thin]",
  bottom: "bottom-4 inset-x-4",
};

export interface FloatingProps {
  anchor: FloatingAnchor;
  /** Sizing only (width). Position comes from the anchor; the content owns its own look. */
  className?: string;
  children: ReactNode;
}

/** Positions a panel over the map. Only placement lives here, so panels stay layout-agnostic
 *  and this is the one place to make them draggable or auto-arranged later. */
export function Floating({ anchor, className, children }: FloatingProps) {
  return (
    <div className={cn("pointer-events-none absolute z-500 flex flex-col gap-3 *:pointer-events-auto", ANCHOR_CLASS[anchor], className)}>
      {children}
    </div>
  );
}
