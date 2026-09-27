import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-pill border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-focus-ring focus-visible:ring-[3px] focus-visible:ring-focus-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-status-danger aria-invalid:ring-status-danger/20 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-brand text-on-accent [a]:hover:bg-brand/80",
        secondary:
          "bg-bg-surface-2 text-text-primary [a]:hover:bg-bg-surface-2/80",
        destructive:
          "bg-status-danger/10 text-status-danger focus-visible:ring-status-danger/20 [a]:hover:bg-status-danger/20",
        outline:
          "border-border-default text-text-primary [a]:hover:bg-bg-surface-2 [a]:hover:text-text-muted",
        ghost:
          "hover:bg-bg-surface-2 hover:text-text-muted",
        link: "text-brand underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
