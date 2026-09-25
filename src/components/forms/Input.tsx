import React from "react";
import { cn } from "@/lib/utils";
import { Input as ShadcnInput } from "@/components/ui/input";

export interface InputProps {
  label?: string;
  hint?: string;
  /** error message — replaces hint and reddens the ring */
  error?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: React.CSSProperties;
}

/** Single-line text field, 48px tall, dark inset surface with a hairline that turns cyan on focus and red on error. */
export function Input({ label, hint, error, value, defaultValue, placeholder, type = "text", prefix, suffix, disabled = false, onChange, id, style, ...rest }: InputProps) {
  return (
    <label htmlFor={id} className="flex flex-col gap-2" style={style}>
      {label && <span className="text-ui-s text-text-secondary">{label}</span>}
      <div
        className={cn(
          "flex h-12 items-center gap-2 rounded-md bg-bg-surface-2 px-4 shadow-(--inset-hairline-strong) transition-ui",
          "focus-within:shadow-[inset_0_0_0_2px_var(--focus-ring)]",
          error && "shadow-[inset_0_0_0_2px_var(--status-danger)]",
          disabled && "opacity-45"
        )}
      >
        {prefix && <span className="flex text-text-muted">{prefix}</span>}
        <ShadcnInput
          id={id}
          type={type}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          onChange={onChange}
          className="h-full min-w-0 flex-1 border-none bg-transparent p-0 text-body-s text-text-primary shadow-none focus-visible:ring-0 placeholder:text-text-muted"
          {...rest}
        />
        {suffix && <span className="flex text-text-muted">{suffix}</span>}
      </div>
      {(error || hint) && (
        <span className={cn("text-caption", error ? "text-status-danger" : "text-text-muted")}>
          {error || hint}
        </span>
      )}
    </label>
  );
}
