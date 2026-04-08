import type { PortfolioSnapshot } from "../../../types/portfolio"

export function VocabularyGrowthChart({ snapshots }: { snapshots: PortfolioSnapshot[] }) {
  if (snapshots.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
        Aún no hay snapshots para visualizar el crecimiento vocabular.
      </section>
    )
  }

  const chartWidth = 640
  const chartHeight = 260
  const padding = 28
  const maxValue = Math.max(...snapshots.map((snapshot) => snapshot.vocabularyGrowthLast30d), 1)
  const barWidth = (chartWidth - padding * 2) / snapshots.length - 12

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Crecimiento vocabular</h2>
      <p className="mt-1 text-sm text-slate-600">Tarjetas activadas o repasadas en los últimos 30 días.</p>
      <div className="mt-5 overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-72 w-full min-w-[560px]">
          {snapshots.map((snapshot, index) => {
            const x = padding + index * ((chartWidth - padding * 2) / snapshots.length)
            const height = (snapshot.vocabularyGrowthLast30d / maxValue) * (chartHeight - padding * 2)
            const y = chartHeight - padding - height
            return (
              <g key={snapshot.id}>
                <rect x={x} y={y} width={barWidth} height={height} rx="10" fill="#0f766e" />
                <text x={x + barWidth / 2} y={chartHeight - 8} textAnchor="middle" className="fill-slate-500 text-[10px]">
                  {new Date(snapshot.computedAt).toLocaleDateString("es-PE", { month: "short" })}
                </text>
                <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" className="fill-slate-700 text-[10px] font-medium">
                  {snapshot.vocabularyGrowthLast30d}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </section>
  )
}
