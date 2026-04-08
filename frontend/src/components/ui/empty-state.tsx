import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "../../lib/utils"

type EmptyStateProps = {
  action?: ReactNode
  className?: string
  description: string
  icon: LucideIcon
  title: string
}

export function EmptyState({
  action,
  className,
  description,
  icon: Icon,
  title,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 px-6 py-12 text-center",
        className
      )}
      data-slot="empty-state"
    >
      <span className="mb-4 rounded-full border bg-background p-3 text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-4 flex items-center gap-2">{action}</div> : null}
    </div>
  )
}
