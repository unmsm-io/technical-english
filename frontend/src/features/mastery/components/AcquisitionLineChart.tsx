import { Radar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { EmptyState } from "../../../components/ui/empty-state"
import type { AcquisitionPoint } from "../../../types/mastery"

interface AcquisitionLineChartProps {
  points: AcquisitionPoint[]
  subtitle?: string
  title?: string
}

export function AcquisitionLineChart({
  points,
  subtitle = "Vocabulario consolidado por semana.",
  title = "Ritmo de adquisición",
}: AcquisitionLineChartProps) {
  if (points.length === 0) {
    return (
      <EmptyState
        description="Aún no hay semanas con adquisiciones registradas."
        icon={Radar}
        title="Sin semanas registradas"
      />
    )
  }

  const chartWidth = 640
  const chartHeight = 260
  const padding = 28
  const maxCount = Math.max(...points.map((point) => point.count), 1)
  const polyline = points
    .map((point, index) => {
      const x = padding + (index / Math.max(points.length - 1, 1)) * (chartWidth - padding * 2)
      const y = chartHeight - padding - (point.count / maxCount) * (chartHeight - padding * 2)
      return `${x},${y}`
    })
    .join(" ")

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <svg aria-label={title} className="h-72 w-full min-w-[560px]" role="img" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          {Array.from({ length: 5 }).map((_, index) => {
            const y = padding + (index / 4) * (chartHeight - padding * 2)
            return (
              <line
                key={y}
                stroke="var(--color-border)"
                strokeDasharray="4 6"
                x1={padding}
                x2={chartWidth - padding}
                y1={y}
                y2={y}
              />
            )
          })}

          <polyline
            fill="none"
            points={polyline}
            stroke="var(--color-foreground)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />

          {points.map((point, index) => {
            const x = padding + (index / Math.max(points.length - 1, 1)) * (chartWidth - padding * 2)
            const y = chartHeight - padding - (point.count / maxCount) * (chartHeight - padding * 2)
            return (
              <g key={point.week}>
                <circle cx={x} cy={y} fill="var(--color-background)" r="5" stroke="var(--color-foreground)" strokeWidth="2" />
                <text className="fill-muted-foreground text-[10px]" textAnchor="middle" x={x} y={chartHeight - 8}>
                  {point.week}
                </text>
                <text className="fill-foreground text-[10px] font-medium" textAnchor="middle" x={x} y={y - 12}>
                  {point.count}
                </text>
              </g>
            )
          })}
        </svg>
      </CardContent>
    </Card>
  )
}
