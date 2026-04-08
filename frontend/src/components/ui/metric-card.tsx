import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import { cn } from "../../lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "./card"

type MetricCardProps = {
  className?: string
  context?: string
  delta?: string
  label: string
  trend?: "down" | "flat" | "up"
  value: number | string
}

const trendStyles = {
  down: {
    icon: ArrowDownRight,
    value: "text-destructive",
  },
  flat: {
    icon: Minus,
    value: "text-muted-foreground",
  },
  up: {
    icon: ArrowUpRight,
    value: "text-[color:var(--color-success)]",
  },
} as const

export function MetricCard({
  className,
  context,
  delta,
  label,
  trend = "flat",
  value,
}: MetricCardProps) {
  const Icon = trendStyles[trend].icon

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium tracking-normal text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
        {delta ? (
          <div className={cn("inline-flex items-center gap-1 text-sm", trendStyles[trend].value)}>
            <Icon className="size-4" />
            <span className="tabular-nums">{delta}</span>
          </div>
        ) : null}
        {context ? <p className="text-xs text-muted-foreground">{context}</p> : null}
      </CardContent>
    </Card>
  )
}
