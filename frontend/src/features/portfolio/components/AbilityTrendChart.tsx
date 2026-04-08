import type { PortfolioSnapshot } from "../../../types/portfolio"

export function AbilityTrendChart({ snapshots }: { snapshots: PortfolioSnapshot[] }) {
  if (snapshots.length === 0 || snapshots.every((snapshot) => snapshot.abilityTheta === null)) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
        Aún no hay snapshots con habilidad estimada.
      </section>
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
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Tendencia de habilidad</h2>
      <p className="mt-1 text-sm text-slate-600">Evolución de `abilityTheta` entre snapshots.</p>
      <div className="mt-5 overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-72 w-full min-w-[560px]">
          <polyline
            points={polyline}
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((point, index) => {
            const x = padding + (index / Math.max(points.length - 1, 1)) * (chartWidth - padding * 2)
            const normalized = ((point.abilityTheta ?? 0) - minValue) / Math.max(maxValue - minValue, 0.1)
            const y = chartHeight - padding - normalized * (chartHeight - padding * 2)
            return (
              <g key={point.id}>
                <circle cx={x} cy={y} r="5" fill="#2563eb" />
                <text x={x} y={chartHeight - 8} textAnchor="middle" className="fill-slate-500 text-[10px]">
                  {new Date(point.computedAt).toLocaleDateString("es-PE", { month: "short" })}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </section>
  )
}
