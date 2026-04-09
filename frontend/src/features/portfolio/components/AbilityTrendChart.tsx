import { EmptyState } from "../../../components/ui/empty-state"
import type { PortfolioSnapshot } from "../../../types/portfolio"
import { TrendingUp } from "lucide-react"

export function AbilityTrendChart({ snapshots }: { snapshots: PortfolioSnapshot[] }) {
  if (snapshots.length === 0 || snapshots.every((snapshot) => snapshot.abilityTheta === null)) {
    return (
      <EmptyState
        description="Aún no hay snapshots con habilidad estimada."
        icon={TrendingUp}
        title="Sin tendencia disponible"
      />
    )
  }

  const points = snapshots.filter((snapshot) => snapshot.abilityTheta !== null)
  const chartWidth = 640
  const chartHeight = 260
  const padding = 28
  const maxValue = Math.max(...points.map((item) => item.abilityTheta ?? 0), 1)
  const minValue = Math.min(...points.map((item) => item.abilityTheta ?? 0), 0)
  const polyline = points
    .map((point, index) => {
      const x = padding + (index / Math.max(points.length - 1, 1)) * (chartWidth - padding * 2)
      const normalized = ((point.abilityTheta ?? 0) - minValue) / Math.max(maxValue - minValue, 0.1)
      const y = chartHeight - padding - normalized * (chartHeight - padding * 2)
      return `${x},${y}`
    })
    .join(" ")

  return (
    <section className="overflow-x-auto rounded-lg border border-border bg-card p-5">
      <svg className="h-72 w-full min-w-[560px]" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        <polyline fill="none" points={polyline} stroke="var(--color-foreground)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        {points.map((point, index) => {
          const x = padding + (index / Math.max(points.length - 1, 1)) * (chartWidth - padding * 2)
          const normalized = ((point.abilityTheta ?? 0) - minValue) / Math.max(maxValue - minValue, 0.1)
          const y = chartHeight - padding - normalized * (chartHeight - padding * 2)
          return (
            <g key={point.id}>
              <circle cx={x} cy={y} fill="var(--color-background)" r="5" stroke="var(--color-foreground)" strokeWidth="2" />
              <text className="fill-muted-foreground text-[10px]" textAnchor="middle" x={x} y={chartHeight - 8}>
                {new Date(point.computedAt).toLocaleDateString("es-PE", { month: "short" })}
              </text>
            </g>
          )
        })}
      </svg>
    </section>
  )
}
