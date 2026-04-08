import type { CohortAcquisitionPoint } from "../../../types/cohort"

interface CohortAcquisitionChartProps {
  points: CohortAcquisitionPoint[]
}

export function CohortAcquisitionChart({ points }: CohortAcquisitionChartProps) {
  if (points.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
        Todavía no hay semanas agregadas para la cohorte.
      </div>
    )
  }

  const chartWidth = 720
  const chartHeight = 280
  const padding = 32
  const maxAverage = Math.max(...points.map((point) => point.averageCount), 1)

  const areaPoints = points
    .map((point, index) => {
      const x =
        padding +
        (index / Math.max(points.length - 1, 1)) * (chartWidth - padding * 2)
      const y =
        chartHeight -
        padding -
        (point.averageCount / maxAverage) * (chartHeight - padding * 2)
      return `${x},${y}`
    })
    .join(" ")

  const polygon = `${padding},${chartHeight - padding} ${areaPoints} ${chartWidth - padding},${chartHeight - padding}`

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Adquisición agregada</h2>
          <p className="mt-1 text-sm text-slate-600">
            Promedio semanal de vocabulario consolidado en la cohorte.
          </p>
        </div>
        <div className="rounded-2xl bg-indigo-50 px-3 py-2 text-right">
          <p className="text-xs uppercase tracking-wide text-indigo-700">Total cohorte</p>
          <p className="text-sm font-semibold text-indigo-950">
            {points.reduce((total, point) => total + point.totalCount, 0)}
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-72 w-full min-w-[620px]"
          role="img"
          aria-label="Adquisición agregada de la cohorte"
        >
          {Array.from({ length: 5 }).map((_, index) => {
            const y = padding + (index / 4) * (chartHeight - padding * 2)
            return (
              <line
                key={y}
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="4 6"
              />
            )
          })}

          <polygon points={polygon} fill="rgba(79, 70, 229, 0.16)" />
          <polyline
            points={areaPoints}
            fill="none"
            stroke="#4f46e5"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {points.map((point, index) => {
            const x =
              padding +
              (index / Math.max(points.length - 1, 1)) * (chartWidth - padding * 2)
            const y =
              chartHeight -
              padding -
              (point.averageCount / maxAverage) * (chartHeight - padding * 2)
            return (
              <g key={point.week}>
                <circle cx={x} cy={y} r="5" fill="#4338ca" />
                <text
                  x={x}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  className="fill-slate-500 text-[10px]"
                >
                  {point.week}
                </text>
                <text
                  x={x}
                  y={y - 12}
                  textAnchor="middle"
                  className="fill-slate-700 text-[10px] font-medium"
                >
                  {point.averageCount.toFixed(1)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </section>
  )
}
