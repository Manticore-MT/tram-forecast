import * as React from "react";
/** Native select with the brand chevron; used for route, stop and horizon pickers. */
export interface SelectProps {
  label?: string;
  hint?: string;
  options: { value: string; label: string }[];
  value?: string;
  disabled?: boolean;
  id?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  style?: React.CSSProperties;
}
export declare function Select(props: SelectProps): JSX.Element;
