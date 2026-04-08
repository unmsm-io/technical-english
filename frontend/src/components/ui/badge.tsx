import type { ComponentProps } from "react"
import { cn } from "../../lib/utils"

const badgeVariants = {
  default: "border-transparent bg-primary text-primary-foreground",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  outline: "border-border bg-transparent text-foreground",
  destructive: "border-transparent bg-destructive/12 text-destructive",
  success: "border-transparent bg-[color:var(--color-success)]/12 text-[color:var(--color-success)]",
  warning: "border-transparent bg-[color:var(--color-warning)]/12 text-[color:var(--color-warning)]",
  info: "border-transparent bg-[color:var(--color-info)]/12 text-[color:var(--color-info)]",
} as const

export interface BadgeProps extends ComponentProps<"span"> {
  variant?: keyof typeof badgeVariants
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium",
        badgeVariants[variant],
        className
      )}
      data-slot="badge"
      {...props}
    />
  )
}
