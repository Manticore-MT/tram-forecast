import * as React from "react";
/** Selectable filter chip — track pickers, route filters, forecast horizons. */
export interface TagProps {
  children?: React.ReactNode;
  selected?: boolean;
  icon?: React.ReactNode;
  /** omit to render a static, non-interactive chip */
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}
export declare function Tag(props: TagProps): JSX.Element;
