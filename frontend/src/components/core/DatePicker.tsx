import * as React from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/core/Button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickerProps {
  value: string
  min?: string
  max?: string
  onChange: (date: string) => void
  "aria-label"?: string
}

export function DatePicker({
  value,
  min,
  max,
  onChange,
  "aria-label": ariaLabel,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const selectedDate = value ? new Date(value + "T00:00:00") : undefined

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const dateStr = format(date, "yyyy-MM-dd")
      onChange(dateStr)
      setOpen(false)
    }
  }

  const displayDate = selectedDate
    ? format(selectedDate, "dd MMM yyyy", { locale: ru })
    : "Выберите дату"

  const minDate = min ? new Date(min + "T00:00:00") : undefined
  const maxDate = max ? new Date(max + "T00:00:00") : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            "w-[150px] justify-start text-left font-normal",
            !selectedDate && "text-text-muted"
          )}
          aria-label={ariaLabel}
          iconLeft={<CalendarIcon className="h-4 w-4" />}
        >
          {displayDate}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={(date) => {
            if (minDate && date < minDate) return true
            if (maxDate && date > maxDate) return true
            return false
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
