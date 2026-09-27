import * as React from "react"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-border-default bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text-primary placeholder:text-text-muted focus-visible:border-focus-ring focus-visible:ring-3 focus-visible:ring-focus-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-border-default/50 disabled:opacity-50 aria-invalid:border-status-danger aria-invalid:ring-3 aria-invalid:ring-status-danger/20 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
