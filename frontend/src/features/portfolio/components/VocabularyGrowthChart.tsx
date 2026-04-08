import { BarChart3 } from "lucide-react"
import { EmptyState } from "../../../components/ui/empty-state"
import type { PortfolioSnapshot } from "../../../types/portfolio"

export function VocabularyGrowthChart({ snapshots }: { snapshots: PortfolioSnapshot[] }) {
  if (snapshots.length === 0) {
    return (
      <EmptyState
        description="Aún no hay snapshots para visualizar el crecimiento vocabular."
        icon={BarChart3}
        title="Sin crecimiento disponible"
      />
    )
  }

  const chartWidth = 640
  const chartHeight = 260
  const padding = 28
  const maxValue = Math.max(...snapshots.map((snapshot) => snapshot.vocabularyGrowthLast30d), 1)
  const barWidth = (chartWidth - padding * 2) / snapshots.length - 12

  return (
    <section className="overflow-x-auto rounded-lg border border-border bg-card p-5">
      <svg className="h-72 w-full min-w-[560px]" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {snapshots.map((snapshot, index) => {
          const x = padding + index * ((chartWidth - padding * 2) / snapshots.length)
          const height = (snapshot.vocabularyGrowthLast30d / maxValue) * (chartHeight - padding * 2)
          const y = chartHeight - padding - height
          return (
            <g key={snapshot.id}>
              <rect fill="var(--color-foreground)" height={height} rx="10" width={barWidth} x={x} y={y} />
              <text className="fill-muted-foreground text-[10px]" textAnchor="middle" x={x + barWidth / 2} y={chartHeight - 8}>
                {new Date(snapshot.computedAt).toLocaleDateString("es-PE", { month: "short" })}
              </text>
              <text className="fill-foreground text-[10px] font-medium" textAnchor="middle" x={x + barWidth / 2} y={y - 8}>
                {snapshot.vocabularyGrowthLast30d}
              </text>
            </g>
          )
        })}
      </svg>
    </section>
  )
}
