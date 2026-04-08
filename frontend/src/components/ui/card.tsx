import { cn } from "../../lib/utils"
import type { ComponentProps } from "react"

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-none",
        className
      )}
      data-slot="card"
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 p-6", className)}
      data-slot="card-header"
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return (
    <h3
      className={cn("text-xl font-semibold tracking-tight", className)}
      data-slot="card-title"
      {...props}
    />
  )
}

export function CardDescription({
  className,
  ...props
}: ComponentProps<"p">) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      data-slot="card-description"
      {...props}
    />
  )
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("px-6 pb-6", className)} data-slot="card-content" {...props} />
}

export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center gap-2 px-6 pb-6", className)}
      data-slot="card-footer"
      {...props}
    />
  )
}
