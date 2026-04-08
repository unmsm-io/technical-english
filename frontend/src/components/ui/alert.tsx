import type { ComponentProps } from "react"
import { cn } from "../../lib/utils"

const alertVariants = {
  default: "border-border bg-card text-card-foreground",
  destructive: "border-destructive/30 bg-destructive/10 text-destructive",
  success:
    "border-[color:var(--color-success)]/30 bg-[color:var(--color-success)]/10 text-[color:var(--color-success)]",
  warning:
    "border-[color:var(--color-warning)]/30 bg-[color:var(--color-warning)]/10 text-[color:var(--color-warning)]",
  info:
    "border-[color:var(--color-info)]/30 bg-[color:var(--color-info)]/10 text-[color:var(--color-info)]",
} as const

export interface AlertProps extends ComponentProps<"div"> {
  variant?: keyof typeof alertVariants
}

export function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div
      className={cn(
        "relative w-full rounded-lg border px-4 py-3 text-sm",
        alertVariants[variant ?? "default"],
        className
      )}
      data-slot="alert"
      role="alert"
      {...props}
    />
  )
}

export function AlertTitle({ className, ...props }: ComponentProps<"h5">) {
  return (
    <h5 className={cn("mb-1 font-medium leading-none tracking-tight", className)} data-slot="alert-title" {...props} />
  )
}

export function AlertDescription({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      data-slot="alert-description"
      {...props}
    />
  )
}
