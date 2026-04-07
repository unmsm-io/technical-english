import type { KcMasteryEntry } from "../../../types/mastery"

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

export function MasteryRadarChart({
  entries,
  size = 360,
}: MasteryRadarChartProps) {
  if (entries.length === 0) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
        Aún no hay knowledge components con respuestas suficientes para construir el radar.
      </div>
    )
  }

  const sortedEntries = [...entries]
    .sort((left, right) => right.pLearned - left.pLearned)
    .slice(0, 8)
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
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Radar de dominio</h2>
          <p className="mt-1 text-sm text-slate-600">
            Top {sortedEntries.length} knowledge components por probabilidad aprendida.
          </p>
        </div>
        <div className="rounded-2xl bg-blue-50 px-3 py-2 text-right">
          <p className="text-xs uppercase tracking-wide text-blue-700">Mastery</p>
          <p className="text-sm font-semibold text-blue-950">
            {Math.round(
              (sortedEntries.reduce((total, entry) => total + entry.pLearned, 0) /
                sortedEntries.length) *
                100
            )}
            %
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="mx-auto h-[320px] w-full min-w-[280px] max-w-[420px]"
            role="img"
            aria-label="Radar de dominio por knowledge component"
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
                  key={radius}
                  points={points}
                  fill="none"
                  stroke="#cbd5e1"
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
                    x1={center}
                    y1={center}
                    x2={axisPoint.x}
                    y2={axisPoint.y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                  <text
                    x={labelPoint.x}
                    y={labelPoint.y}
                    textAnchor={labelPoint.x >= center ? "start" : "end"}
                    dominantBaseline="middle"
                    className="fill-slate-500 text-[10px] font-medium"
                  >
                    {entry.kcNameEs}
                  </text>
                </g>
              )
            })}

            <polygon
              points={polygonPoints}
              fill="rgba(37, 99, 235, 0.18)"
              stroke="#2563eb"
              strokeWidth="2.5"
            />

            {sortedEntries.map((entry, index) => {
              const angle = (360 / sortedEntries.length) * index
              const point = polarToCartesian(center, maxRadius * entry.pLearned, angle)

              return (
                <circle
                  key={`${entry.kcId}-point`}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#1d4ed8"
                />
              )
            })}
          </svg>
        </div>

        <div className="space-y-3">
          {sortedEntries.map((entry) => (
            <div
              key={entry.kcId}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-900">{entry.kcNameEs}</span>
                <span className="text-sm font-semibold text-slate-700">
                  {Math.round(entry.pLearned * 100)}%
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${Math.max(6, Math.round(entry.pLearned * 100))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
