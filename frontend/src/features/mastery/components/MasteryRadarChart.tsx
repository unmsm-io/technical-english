import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { EmptyState } from "../../../components/ui/empty-state"
import type { KcMasteryEntry } from "../../../types/mastery"
import { Radar } from "lucide-react"

interface MasteryRadarChartProps {
  entries: KcMasteryEntry[]
  size?: number
}

function polarToCartesian(center: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180
  return {
    x: center + radius * Math.cos(angleInRadians),
    y: center + radius * Math.sin(angleInRadians),
  }
}

export function MasteryRadarChart({ entries, size = 360 }: MasteryRadarChartProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        description="Aún no hay knowledge components con respuestas suficientes para construir el radar."
        icon={Radar}
        title="Sin radar disponible"
      />
    )
  }

  const sortedEntries = [...entries].sort((left, right) => right.pLearned - left.pLearned).slice(0, 8)
  const center = size / 2
  const maxRadius = size * 0.34
  const levels = 4
  const polygonPoints = sortedEntries
    .map((entry, index) => {
      const angle = (360 / sortedEntries.length) * index
      const point = polarToCartesian(center, maxRadius * entry.pLearned, angle)
      return `${point.x},${point.y}`
    })
    .join(" ")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Radar de dominio</CardTitle>
        <CardDescription>
          Top {sortedEntries.length} knowledge components por probabilidad aprendida.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="overflow-x-auto">
          <svg
            aria-label="Radar de dominio por knowledge component"
            className="mx-auto h-[320px] w-full min-w-[280px] max-w-[420px]"
            role="img"
            viewBox={`0 0 ${size} ${size}`}
          >
            {Array.from({ length: levels }).map((_, levelIndex) => {
              const radius = (maxRadius / levels) * (levelIndex + 1)
              const points = sortedEntries
                .map((_, index) => {
                  const angle = (360 / sortedEntries.length) * index
                  const point = polarToCartesian(center, radius, angle)
                  return `${point.x},${point.y}`
                })
                .join(" ")

              return (
                <polygon
                  fill="none"
                  key={radius}
                  points={points}
                  stroke="var(--color-border)"
                  strokeWidth="1"
                />
              )
            })}

            {sortedEntries.map((entry, index) => {
              const angle = (360 / sortedEntries.length) * index
              const axisPoint = polarToCartesian(center, maxRadius, angle)
              const labelPoint = polarToCartesian(center, maxRadius + 26, angle)

              return (
                <g key={entry.kcId}>
                  <line
                    stroke="var(--color-border)"
                    strokeWidth="1"
                    x1={center}
                    x2={axisPoint.x}
                    y1={center}
                    y2={axisPoint.y}
                  />
                  <text
                    className="fill-muted-foreground text-[10px] font-medium"
                    dominantBaseline="middle"
                    textAnchor={labelPoint.x >= center ? "start" : "end"}
                    x={labelPoint.x}
                    y={labelPoint.y}
                  >
                    {entry.kcNameEs}
                  </text>
                </g>
              )
            })}

            <polygon
              fill="color-mix(in srgb, var(--color-foreground) 10%, transparent)"
              points={polygonPoints}
              stroke="var(--color-foreground)"
              strokeWidth="2.5"
            />

            {sortedEntries.map((entry, index) => {
              const angle = (360 / sortedEntries.length) * index
              const point = polarToCartesian(center, maxRadius * entry.pLearned, angle)

              return <circle cx={point.x} cy={point.y} fill="var(--color-foreground)" key={`${entry.kcId}-point`} r="4" />
            })}
          </svg>
        </div>

        <div className="space-y-3">
          {sortedEntries.map((entry) => (
            <div className="rounded-lg border border-border bg-muted/20 px-4 py-3" key={entry.kcId}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">{entry.kcNameEs}</span>
                <span className="text-sm font-semibold tabular-nums">{Math.round(entry.pLearned * 100)}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground"
                  style={{ width: `${Math.max(6, Math.round(entry.pLearned * 100))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
