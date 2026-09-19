import * as React from "react";
/** Hover label for icon-only controls and chart points. Single line, no rich content. */
export interface TooltipProps {
  children?: React.ReactNode;
  content: React.ReactNode;
  placement?: "top" | "bottom";
  style?: React.CSSProperties;
}
export declare function Tooltip(props: TooltipProps): JSX.Element;
