import * as React from "react";
/**
 * Vertical dated timeline — the hackathon schedule pattern ("Таймлайн").
 */
export interface TimelineProps {
  items: { date: string; title: React.ReactNode; note?: React.ReactNode; done?: boolean }[];
  style?: React.CSSProperties;
}
export declare function Timeline(props: TimelineProps): JSX.Element;
