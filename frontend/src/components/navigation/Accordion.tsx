import React from "react";
import {
  Accordion as AccordionRoot,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export interface AccordionProps {
  items: { question: React.ReactNode; answer: React.ReactNode }[];
  /** index open on mount; -1 for all closed */
  defaultOpen?: number;
  style?: React.CSSProperties;
}

/** Disclosure list — the FAQ pattern from the hackathon site ("Ответы на вопросы"). */
export function Accordion({ items = [], defaultOpen = -1, style, ...rest }: AccordionProps) {
  const defaultValue = defaultOpen >= 0 ? String(defaultOpen) : undefined;

  return (
    <AccordionRoot
      type="single"
      collapsible
      defaultValue={defaultValue}
      className="flex flex-col gap-2"
      style={style}
      {...rest}
    >
      {items.map((it, i) => (
        <AccordionItem
          key={i}
          value={String(i)}
          className="rounded-lg border-none bg-bg-surface shadow-(--inset-hairline) transition-ui"
        >
          <AccordionTrigger className="px-6 py-5 text-h4 text-text-primary no-underline hover:no-underline">
            {it.question}
          </AccordionTrigger>
          <AccordionContent className="max-w-180 px-6 pb-6 text-body-s text-text-secondary">
            {it.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </AccordionRoot>
  );
}
