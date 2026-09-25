import React from "react";
import { Tabs as TabsRoot, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface TabsProps {
  items: { value: string; label: React.ReactNode }[];
  value?: string;
  variant?: "pill" | "underline";
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
}

/** Section switcher. Pill variant for compact in-panel switching, underline for page-level sections. */
export function Tabs({ items = [], value, onChange, variant = "pill", style, ...rest }: TabsProps) {
  const active = value ?? items[0]?.value;

  return (
    <TabsRoot value={active} onValueChange={onChange}>
      <TabsList
        style={style}
        {...rest}
        className={cn(
          "h-auto w-fit p-1",
          variant === "pill"
            ? "gap-1 rounded-pill bg-bg-surface-2 shadow-(--inset-hairline)"
            : "gap-6 rounded-none bg-transparent p-0 shadow-[inset_0_-1px_0_var(--border-subtle)]"
        )}
      >
        {items.map((it) => (
          <TabsTrigger
            key={it.value}
            value={it.value}
            className={cn(
              "whitespace-nowrap border-transparent text-text-muted shadow-none transition-ui",
              variant === "pill"
                ? "h-9 rounded-pill px-[18px] text-ui-s data-active:bg-bg-inverse data-active:text-text-inverse data-active:shadow-none"
                : "h-auto rounded-none px-0 pb-3.5 text-ui data-active:bg-transparent data-active:text-text-primary data-active:shadow-[inset_0_-2px_0_var(--brand-accent)]"
            )}
          >
            {it.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </TabsRoot>
  );
}
