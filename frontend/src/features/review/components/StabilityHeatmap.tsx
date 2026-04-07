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

export function StabilityHeatmap({ cards = [], stats }: StabilityHeatmapProps) {
  const counts = buckets.map((bucket) => ({
    ...bucket,
    value: cards.filter(
      (card) => card.stability >= bucket.min && card.stability < bucket.max
    ).length,
  }))

  const total = counts.reduce((sum, bucket) => sum + bucket.value, 0) || stats?.totalCards || 1

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Heatmap de estabilidad</h3>
          <p className="text-sm text-slate-600">
            Distribución de tarjetas según la estabilidad calculada por FSRS.
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-5">
        {counts.map((bucket, index) => {
          const intensity = Math.max(0.12, bucket.value / total)
          return (
            <div
              key={bucket.label}
              className="rounded-2xl p-4 text-slate-900"
              style={{
                background: `rgba(37, 99, 235, ${Math.min(0.9, intensity + index * 0.06)})`,
              }}
            >
              <p className="text-xs uppercase tracking-wide text-white/80">{bucket.label}</p>
              <p className="mt-4 text-3xl font-semibold text-white">{bucket.value}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
