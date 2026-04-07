import type { CefrLevel } from "../../../types/task"

export function AbilityIndicator({
  theta,
  standardError,
  predictedCefr,
}: {
  theta: number | null
  standardError: number | null
  predictedCefr: CefrLevel | null
}) {
  if (theta === null) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-gray-900">Habilidad IRT</p>
        <p className="mt-2 text-sm text-gray-500">Aún no hay theta estimado.</p>
      </div>
    )
  }

  const barWidth = Math.max(8, Math.min(100, ((theta + 4) / 8) * 100))

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">Habilidad IRT</p>
          <p className="mt-1 text-xs text-gray-500">
            {predictedCefr ? `CEFR predicho: ${predictedCefr}` : "Sin CEFR predicho"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-gray-900">{theta.toFixed(2)}</p>
          <p className="text-xs text-gray-500">
            SE {standardError !== null ? standardError.toFixed(2) : "—"}
          </p>
        </div>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  )
}
