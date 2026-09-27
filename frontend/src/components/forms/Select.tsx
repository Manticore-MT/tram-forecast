import React from "react";
import { cn } from "@/lib/utils";
import {
  Select as ShadcnSelectRoot,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export interface SelectProps {
  label?: string;
  hint?: string;
  options: { value: string; label: string }[];
  value?: string;
  disabled?: boolean;
  id?: string;
  /** md (48px, default) for standalone forms; sm (36px) for inline use next to h-9 controls — same surface/shadow/radius as Input, just shorter. */
  size?: "sm" | "md";
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  style?: React.CSSProperties;
}

/** Native select with the brand chevron; used for route, stop and horizon pickers. */
export function Select({ label, hint, options = [], value, onChange, disabled = false, id, size = "md", style, ...rest }: SelectProps) {
  return (
    <label htmlFor={id} className="flex flex-col gap-2" style={style}>
      {label && <span className="text-ui-s text-text-secondary">{label}</span>}
      <ShadcnSelectRoot
        value={value || ""}
        onValueChange={(newValue) => {
          if (onChange) {
            const event = { target: { value: newValue } } as React.ChangeEvent<HTMLSelectElement>;
            onChange(event);
          }
        }}
        disabled={disabled}
        {...rest}
      >
        <SelectTrigger
          id={id}
          className={cn(
            "w-full rounded-md border-none bg-bg-surface-2 py-0 text-text-primary",
            size === "sm" ? "h-9! px-3 text-ui-s" : "h-12! px-4 text-body-s",
            "shadow-(--inset-hairline-strong) transition-ui",
            "focus-visible:shadow-[inset_0_0_0_2px_var(--focus-ring)] focus-visible:ring-0",
            "data-[state=open]:shadow-[inset_0_0_0_2px_var(--focus-ring)] data-[state=open]:ring-0 data-[state=closed]:ring-0",
            disabled && "cursor-not-allowed opacity-45"
          )}
        >
          <SelectValue placeholder="Выбрать..." />
        </SelectTrigger>
        <SelectContent className="bg-bg-surface-2 border-border-default">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-text-primary">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </ShadcnSelectRoot>
      {hint && <span className="text-caption text-text-muted">{hint}</span>}
    </label>
  );
}
