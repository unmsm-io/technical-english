import type { StabilityBucket } from "../../../types/mastery"

interface StabilityHeatmapChartProps {
  buckets: StabilityBucket[]
}

export function StabilityHeatmapChart({ buckets }: StabilityHeatmapChartProps) {
  if (buckets.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
        Aún no hay estabilidad suficiente para construir el heatmap.
      </div>
    )
  }

  const max = Math.max(...buckets.map((bucket) => bucket.count), 1)

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Heatmap de estabilidad</h2>
        <p className="mt-1 text-sm text-slate-600">
          Distribución de cards FSRS por rango de estabilidad.
        </p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {buckets.map((bucket) => {
          const intensity = bucket.count / max
          return (
            <div
              key={bucket.label}
              className="rounded-2xl border border-slate-200 p-4"
              style={{
                backgroundColor: `rgba(37, 99, 235, ${0.12 + intensity * 0.4})`,
              }}
            >
              <p className="text-xs uppercase tracking-wide text-slate-700">{bucket.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{bucket.count}</p>
              <p className="mt-1 text-sm text-slate-700">cards en este rango</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
