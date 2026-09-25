import React from "react";
import { cn } from "@/lib/utils";
import { Checkbox as ShadcnCheckbox } from "@/components/ui/checkbox";

export interface CheckboxProps {
  label?: React.ReactNode;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: React.CSSProperties;
}

/** 20px square checkbox; checked state fills signal red with a white tick. */
export function Checkbox({ label, checked = false, onChange, disabled = false, style, ...rest }: CheckboxProps) {
  return (
    <label
      style={style}
      className={cn(
        "inline-flex items-center gap-3 text-body-s text-text-secondary",
        disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"
      )}
    >
      <ShadcnCheckbox
        checked={checked}
        onCheckedChange={(newChecked) => {
          if (onChange) {
            const event = { target: { checked: newChecked } } as any;
            onChange(event);
          }
        }}
        disabled={disabled}
        className={cn("size-5 rounded-xs border-border-strong!")}
        {...rest}
      />
      {label}
    </label>
  );
}
