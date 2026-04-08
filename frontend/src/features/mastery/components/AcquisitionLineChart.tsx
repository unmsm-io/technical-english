import type { AcquisitionPoint } from "../../../types/mastery"

interface AcquisitionLineChartProps {
  points: AcquisitionPoint[]
  title?: string
  subtitle?: string
}

export function AcquisitionLineChart({
  points,
  title = "Ritmo de adquisición",
  subtitle = "Vocabulario consolidado por semana.",
}: AcquisitionLineChartProps) {
  if (points.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
        Aún no hay semanas con adquisiciones registradas.
      </div>
    )
  }

  const chartWidth = 640
  const chartHeight = 260
  const padding = 28
  const maxCount = Math.max(...points.map((point) => point.count), 1)
  const polyline = points
    .map((point, index) => {
      const x =
        padding +
        (index / Math.max(points.length - 1, 1)) * (chartWidth - padding * 2)
      const y =
        chartHeight -
        padding -
        (point.count / maxCount) * (chartHeight - padding * 2)
      return `${x},${y}`
    })
    .join(" ")

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 px-3 py-2">
          <p className="text-xs uppercase tracking-wide text-emerald-700">Total</p>
          <p className="text-sm font-semibold text-emerald-950">
            {points.reduce((total, point) => total + point.count, 0)}
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-72 w-full min-w-[560px]"
          role="img"
          aria-label={title}
        >
          {Array.from({ length: 5 }).map((_, index) => {
            const y =
              padding + (index / 4) * (chartHeight - padding * 2)
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

          <polyline
            fill="none"
            stroke="#0f766e"
            strokeWidth="3"
            points={polyline}
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
              (point.count / maxCount) * (chartHeight - padding * 2)
            return (
              <g key={point.week}>
                <circle cx={x} cy={y} r="5" fill="#0f766e" />
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
                  {point.count}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </section>
  )
}
