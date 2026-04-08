import type { ComponentProps } from "react"
import { cn } from "../../lib/utils"

export function Kbd({ className, ...props }: ComponentProps<"kbd">) {
  return (
    <kbd
      className={cn(
        "inline-flex min-h-5 items-center rounded border bg-muted px-1.5 font-mono text-[11px] font-medium text-muted-foreground tabular-nums",
        className
      )}
      data-slot="kbd"
      {...props}
    />
  )
}
