import React from "react";
import { cn } from "@/lib/utils";

export interface TimelineProps {
  items: { date: string; title: React.ReactNode; note?: React.ReactNode; done?: boolean }[];
  className?: string;
  style?: React.CSSProperties;
}

/** Vertical dated timeline — the hackathon schedule pattern ("Таймлайн"). */
export function Timeline({ items = [], className, style, ...rest }: TimelineProps) {
  return (
    <ol className={cn("list-none m-0 p-0 flex flex-col", className)} style={style} {...rest}>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <li key={i} className="grid grid-cols-[28px_1fr] gap-5">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "mt-1.5 rounded-pill",
                  it.done
                    ? "w-3.5 h-3.5 bg-brand shadow-[0_0_0_4px_var(--brand-accent-quiet)]"
                    : "w-3 h-3 shadow-[inset_0_0_0_2px_var(--border-strong)]"
                )}
              />
              {!last && <span className="flex-1 w-0.5 mt-1.5 bg-border-subtle" />}
            </div>
            <div className={cn(!last && "pb-8")}>
              <div className={cn("text-ui font-mono", it.done ? "text-brand" : "text-text-muted")}>{it.date}</div>
              <div className="mt-1.5 text-body text-text-primary">{it.title}</div>
              {it.note && <div className="mt-1 text-body-s text-text-muted">{it.note}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
