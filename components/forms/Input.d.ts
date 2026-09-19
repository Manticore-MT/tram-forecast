import * as React from "react";
/** Single-line text field, 48px tall, dark inset surface with a hairline that turns cyan on focus and red on error. */
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
export declare function Input(props: InputProps): JSX.Element;
