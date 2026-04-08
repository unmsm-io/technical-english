import type { ComponentProps } from "react"
import { ChevronRight, MoreHorizontal } from "lucide-react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "../../lib/utils"

export function Breadcrumb({ ...props }: ComponentProps<"nav">) {
  return <nav aria-label="Breadcrumb" data-slot="breadcrumb" {...props} />
}

export function BreadcrumbList({ className, ...props }: ComponentProps<"ol">) {
  return (
    <ol
      className={cn("flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground", className)}
      data-slot="breadcrumb-list"
      {...props}
    />
  )
}

export function BreadcrumbItem({ className, ...props }: ComponentProps<"li">) {
  return <li className={cn("inline-flex items-center gap-1.5", className)} data-slot="breadcrumb-item" {...props} />
}

export function BreadcrumbLink({
  asChild,
  className,
  ...props
}: ComponentProps<"a"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "a"
  return <Comp className={cn("transition-colors hover:text-foreground", className)} data-slot="breadcrumb-link" {...props} />
}

export function BreadcrumbPage({ className, ...props }: ComponentProps<"span">) {
  return <span aria-current="page" className={cn("font-medium text-foreground", className)} data-slot="breadcrumb-page" {...props} />
}

export function BreadcrumbSeparator({ className, ...props }: ComponentProps<"li">) {
  return (
    <li aria-hidden="true" className={cn("[&>svg]:size-3.5", className)} data-slot="breadcrumb-separator" {...props}>
      <ChevronRight />
    </li>
  )
}

export function BreadcrumbEllipsis({ className, ...props }: ComponentProps<"span">) {
  return (
    <span className={cn("flex size-9 items-center justify-center", className)} data-slot="breadcrumb-ellipsis" {...props}>
      <MoreHorizontal className="size-4" />
      <span className="sr-only">Más</span>
    </span>
  )
}
