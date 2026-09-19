import * as React from "react";
/**
 * INTENTIONAL ADDITION (domain): five-segment passenger-load indicator on the shared --load-1..5 scale.
 */
export interface LoadMeterProps {
  /** 0..1 */
  value?: number;
  segments?: number;
  showLabel?: boolean;
  width?: number | string;
  style?: React.CSSProperties;
}
export declare function LoadMeter(props: LoadMeterProps): JSX.Element;
