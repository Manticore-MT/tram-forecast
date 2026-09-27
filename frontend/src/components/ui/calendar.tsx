import * as React from "react"
import { ru } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

const NAV_BUTTON =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-full text-text-secondary outline-none transition-colors hover:bg-glass-fill hover:text-text-primary focus-visible:shadow-[inset_0_0_0_2px_var(--focus-ring)] disabled:pointer-events-none disabled:opacity-40"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={ru}
      showOutsideDays={showOutsideDays}
      className={cn("p-1", className)}
      classNames={{
        months: "flex flex-col gap-4 sm:flex-row",
        month: "flex flex-col gap-3",
        month_caption: "relative flex items-center justify-center pt-1",
        caption_label: "text-ui-s font-semibold text-text-primary capitalize",
        nav: "absolute inset-x-1 top-1 flex items-center justify-between",
        button_previous: NAV_BUTTON,
        button_next: NAV_BUTTON,
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-9 rounded-md text-caption font-normal text-text-muted capitalize",
        week: "mt-1 flex w-full",
        day: "relative h-9 w-9 p-0 text-center text-ui-s [&:has([data-selected].range-end)]:rounded-r-md [&:has([data-selected].outside)]:bg-bg-surface-2/50 [&:has([data-selected])]:bg-bg-surface-2 first:[&:has([data-selected])]:rounded-l-md last:[&:has([data-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day_button:
          "inline-flex size-9 items-center justify-center rounded-md font-normal text-text-primary outline-none transition-colors hover:bg-glass-fill focus-visible:shadow-[inset_0_0_0_2px_var(--focus-ring)] aria-selected:opacity-100",
        range_end: "range-end",
        selected:
          "[&>button]:bg-brand [&>button]:text-on-accent hover:[&>button]:bg-brand hover:[&>button]:text-on-accent focus:[&>button]:bg-brand focus:[&>button]:text-on-accent",
        today: "[&>button]:bg-bg-surface-2 [&>button]:text-text-primary",
        outside:
          "outside text-text-muted opacity-50 aria-selected:bg-bg-surface-2/50 aria-selected:text-text-muted aria-selected:opacity-30",
        disabled: "text-text-muted opacity-40",
        range_middle:
          "aria-selected:bg-bg-surface-2 aria-selected:text-text-primary",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...rest }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4" {...rest} />
          ) : (
            <ChevronRight className="size-4" {...rest} />
          ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
