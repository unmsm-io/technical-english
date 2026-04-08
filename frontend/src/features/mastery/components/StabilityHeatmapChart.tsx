import { Radar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { EmptyState } from "../../../components/ui/empty-state"
import type { StabilityBucket } from "../../../types/mastery"

interface StabilityHeatmapChartProps {
  buckets: StabilityBucket[]
}

export function StabilityHeatmapChart({ buckets }: StabilityHeatmapChartProps) {
  if (buckets.length === 0) {
    return (
      <EmptyState
        description="Aún no hay estabilidad suficiente para construir el heatmap."
        icon={Radar}
        title="Sin estabilidad suficiente"
      />
    )
  }

  const max = Math.max(...buckets.map((bucket) => bucket.count), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Heatmap de estabilidad</CardTitle>
        <CardDescription>Distribución de cards FSRS por rango de estabilidad.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {buckets.map((bucket) => {
          const intensity = bucket.count / max
          return (
            <div
              className="rounded-lg border border-border p-4"
              key={bucket.label}
              style={{
                backgroundColor: `color-mix(in srgb, var(--color-foreground) ${12 + intensity * 30}%, var(--color-background))`,
              }}
            >
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{bucket.label}</p>
              <p className="mt-3 text-3xl font-semibold tabular-nums">{bucket.count}</p>
              <p className="mt-1 text-sm text-muted-foreground">cards en este rango</p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
