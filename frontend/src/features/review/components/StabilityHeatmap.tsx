import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import type { ReviewCard, ReviewStats } from "../../../types/review"

interface StabilityHeatmapProps {
  cards?: ReviewCard[]
  stats?: ReviewStats
}

const buckets = [
  { label: "0-1d", min: 0, max: 1 },
  { label: "1-7d", min: 1, max: 7 },
  { label: "7-30d", min: 7, max: 30 },
  { label: "30-90d", min: 30, max: 90 },
  { label: "90+d", min: 90, max: Number.POSITIVE_INFINITY },
]

const bucketShades = [
  "var(--color-muted)",
  "color-mix(in srgb, var(--color-foreground) 12%, var(--color-background))",
  "color-mix(in srgb, var(--color-foreground) 22%, var(--color-background))",
  "color-mix(in srgb, var(--color-foreground) 34%, var(--color-background))",
  "color-mix(in srgb, var(--color-foreground) 48%, var(--color-background))",
]

export function StabilityHeatmap({ cards = [], stats }: StabilityHeatmapProps) {
  const counts = buckets.map((bucket) => ({
    ...bucket,
    value: cards.filter(
      (card) => card.stability >= bucket.min && card.stability < bucket.max
    ).length,
  }))

  const maxValue = Math.max(1, ...counts.map((bucket) => bucket.value), stats?.totalCards ?? 0)
  const cellWidth = 96
  const cellHeight = 88
  const gap = 12
  const width = counts.length * cellWidth + (counts.length - 1) * gap
  const height = cellHeight

  return (
    <Card>
      <CardHeader>
        <CardTitle>Heatmap de estabilidad</CardTitle>
        <CardDescription>
          Distribución del deck según la estabilidad calculada por FSRS.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <svg aria-label="Heatmap de estabilidad" className="w-full" viewBox={`0 0 ${width} ${height}`}>
          {counts.map((bucket, index) => {
            const x = index * (cellWidth + gap)
            const fillOpacity = Math.max(0.18, bucket.value / maxValue)
            return (
              <g key={bucket.label}>
                <rect
                  fill={bucketShades[index]}
                  fillOpacity={fillOpacity}
                  height={cellHeight}
                  rx="18"
                  width={cellWidth}
                  x={x}
                  y="0"
                />
                <text className="fill-muted-foreground text-[12px]" x={x + 14} y="22">
                  {bucket.label}
                </text>
                <text className="fill-foreground text-[28px] font-semibold" x={x + 14} y="58">
                  {bucket.value}
                </text>
              </g>
            )
          })}
        </svg>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {counts.map((bucket, index) => (
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1" key={bucket.label}>
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: bucketShades[index] }}
              />
              {bucket.label}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
