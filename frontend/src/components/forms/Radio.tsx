import React from "react";
import { cn } from "@/lib/utils";
import { RadioGroup as ShadcnRadioGroup, RadioGroupItem as ShadcnRadioGroupItem } from "@/components/ui/radio-group";

export interface RadioProps {
  label?: React.ReactNode;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: React.CSSProperties;
}

/** Single-choice control; selected state is a 6px red ring-fill. */
export function Radio({ label, checked = false, onChange, disabled = false, name, value = "on", style, ...rest }: RadioProps) {
  return (
    <label
      style={style}
      className={cn(
        "inline-flex items-center gap-3 text-body-s text-text-secondary",
        disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"
      )}
    >
      <ShadcnRadioGroup
        value={checked ? value : ""}
        onValueChange={(newValue) => {
          if (onChange) {
            const event = { target: { checked: newValue === value, value, name } } as any;
            onChange(event);
          }
        }}
        disabled={disabled}
      >
        <ShadcnRadioGroupItem
          value={value}
          disabled={disabled}
          className={cn(
            "size-5 rounded-full transition-ui",
            checked
              ? "shadow-[inset_0_0_0_6px_var(--brand-accent)]"
              : "shadow-[inset_0_0_0_1.5px_var(--border-strong)]"
          )}
          {...rest}
        />
      </ShadcnRadioGroup>
      {label}
    </label>
  );
}
