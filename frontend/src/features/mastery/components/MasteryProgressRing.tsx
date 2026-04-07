interface MasteryProgressRingProps {
  masteredCount: number
  totalKcs: number
}

export function MasteryProgressRing({
  masteredCount,
  totalKcs,
}: MasteryProgressRingProps) {
  const ratio = totalKcs > 0 ? masteredCount / totalKcs : 0
  const radius = 58
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - ratio)

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Progreso de dominio</h2>
          <p className="mt-1 text-sm text-slate-600">
            Knowledge components por encima del threshold de mastery.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-3 py-2 text-right">
          <p className="text-xs uppercase tracking-wide text-slate-500">Threshold</p>
          <p className="text-sm font-semibold text-slate-900">P(L) ≥ 95%</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex h-40 w-40 items-center justify-center">
          <svg viewBox="0 0 160 160" className="h-40 w-40" role="img" aria-label="Progreso de dominio">
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="14"
            />
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#2563eb"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 80 80)"
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-3xl font-semibold text-slate-950">{Math.round(ratio * 100)}%</p>
            <p className="text-xs uppercase tracking-wide text-slate-500">mastery</p>
          </div>
        </div>

        <div className="grid w-full gap-3 sm:max-w-sm">
          <MetricCard label="KCs dominados" value={`${masteredCount}`} />
          <MetricCard label="KCs monitoreados" value={`${totalKcs}`} />
          <MetricCard
            label="Pendientes de consolidar"
            value={`${Math.max(totalKcs - masteredCount, 0)}`}
          />
        </div>
      </div>
    </section>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  )
}
