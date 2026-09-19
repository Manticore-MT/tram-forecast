import * as React from "react";
/**
 * Disclosure list — the FAQ pattern from the hackathon site ("Ответы на вопросы").
 */
export interface AccordionProps {
  items: { question: React.ReactNode; answer: React.ReactNode }[];
  /** index open on mount; -1 for all closed */
  defaultOpen?: number;
  style?: React.CSSProperties;
}
export declare function Accordion(props: AccordionProps): JSX.Element;
