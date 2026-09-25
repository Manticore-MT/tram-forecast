import React from "react";
import { cn } from "@/lib/utils";
import { Switch as ShadcnSwitch } from "@/components/ui/switch";

export interface SwitchProps {
  label?: React.ReactNode;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: React.CSSProperties;
}

/** 44×26 toggle for immediate-effect settings (live data, overlays, auto-refresh). */
export function Switch({ label, checked = false, onChange, disabled = false, style, ...rest }: SwitchProps) {
  return (
    <label
      style={style}
      className={cn(
        "inline-flex items-center gap-3 text-body-s text-text-secondary",
        disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"
      )}
    >
      <ShadcnSwitch
        checked={checked}
        onCheckedChange={(newChecked) => {
          if (onChange) {
            const event = { target: { checked: newChecked } } as any;
            onChange(event);
          }
        }}
        disabled={disabled}
        className={cn(
          "w-11 h-6",
          checked ? "bg-brand" : "bg-ink-600"
        )}
        {...rest}
      />
      {label}
    </label>
  );
}
