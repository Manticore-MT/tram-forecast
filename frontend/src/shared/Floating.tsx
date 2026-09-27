import { useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Slots of the map screen: a narrow centered top bar, side columns from the top edge down to
 *  the bottom strip, and the full-width bottom strip. */
export type FloatingAnchor = "top" | "left" | "right" | "bottom";

const ANCHOR_CLASS: Record<FloatingAnchor, string> = {
  top: "top-4 left-1/2 -translate-x-1/2",
  left: "top-4 left-4 overflow-y-auto [scrollbar-color:var(--ink-600)_transparent] [scrollbar-width:thin]",
  right: "top-4 right-4 overflow-y-auto [scrollbar-color:var(--ink-600)_transparent] [scrollbar-width:thin]",
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
  const ref = useRef<HTMLDivElement>(null);

  // The bottom strip's height varies with content (legend wrapping, error/loading states, …),
  // so the left/right columns can't stop at a guessed pixel offset — that either clips their
  // last card or leaves a gap. They track the strip's real height via a CSS var instead.
  useLayoutEffect(() => {
    if (anchor !== "bottom") return;
    const el = ref.current;
    const root = el?.parentElement;
    if (!el || !root) return;
    const observer = new ResizeObserver(([entry]) => {
      root.style.setProperty("--strip-h", `${entry.contentRect.height}px`);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [anchor]);

  return (
    <div
      ref={ref}
      className={cn(
        "pointer-events-none absolute z-10 flex flex-col gap-3 *:pointer-events-auto",
        ANCHOR_CLASS[anchor],
        (anchor === "left" || anchor === "right") && "bottom-[calc(var(--strip-h,192px)+2rem)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
