import * as React from "react";
/**
 * Section switcher. Pill variant for compact in-panel switching, underline for page-level sections.
 */
export interface TabsProps {
  items: { value: string; label: React.ReactNode }[];
  value?: string;
  variant?: "pill" | "underline";
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
}
export declare function Tabs(props: TabsProps): JSX.Element;
