import type { PilotMetricEntry } from "../../../types/pilot"

function normalize(value: number | null) {
  if (value === null) {
    return 0
  }
  return Math.max(Math.min(Math.abs(value), 2), 0)
}

export function CohenDChart({ metrics }: { metrics: PilotMetricEntry }) {
  const bars = [
    {
      key: "vocabulary",
      label: "Vocabulario",
      value: metrics.vocabularyCohenD,
      color: "fill-blue-500",
    },
    {
      key: "comprehension",
      label: "Comprensión",
      value: metrics.comprehensionCohenD,
      color: "fill-emerald-500",
    },
  ]

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium text-slate-900">Tamaño de efecto</h2>
        <p className="text-sm text-slate-500">
          Referencia rápida de Cohen&apos;s d para vocabulario y comprensión.
        </p>
      </div>
      <div className="mt-6 overflow-x-auto">
        <svg viewBox="0 0 420 220" className="min-w-[320px]">
          <line x1="48" y1="180" x2="390" y2="180" className="stroke-slate-200" />
          <line x1="48" y1="30" x2="48" y2="180" className="stroke-slate-200" />
          {[0.2, 0.5, 0.8, 1.2, 1.6, 2.0].map((tick, index) => {
            const y = 180 - (tick / 2) * 140
            return (
              <g key={tick}>
                <line x1="42" y1={y} x2="390" y2={y} className="stroke-slate-100" />
                <text x="10" y={y + 4} className="fill-slate-400 text-[11px]">
                  {index === 5 ? "2.0+" : tick.toFixed(1)}
                </text>
              </g>
            )
          })}
          {bars.map((bar, index) => {
            const height = normalize(bar.value) / 2 * 140
            const x = 110 + index * 130
            const y = 180 - height
            return (
              <g key={bar.key}>
                <rect x={x} y={y} width="58" height={height} rx="18" className={bar.color} />
                <text x={x + 29} y="202" textAnchor="middle" className="fill-slate-600 text-[12px]">
                  {bar.label}
                </text>
                <text x={x + 29} y={Math.max(y - 10, 22)} textAnchor="middle" className="fill-slate-900 text-[13px] font-semibold">
                  {bar.value === null ? "N/D" : bar.value.toFixed(2)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </section>
  )
}
