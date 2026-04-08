import type { CohortMasteryDistribution } from "../../../types/cohort"

interface CohortMasteryHeatmapProps {
  distributions: CohortMasteryDistribution[]
}

export function CohortMasteryHeatmap({
  distributions,
}: CohortMasteryHeatmapProps) {
  if (distributions.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
        La cohorte aún no tiene datos suficientes de mastery.
      </div>
    )
  }

  const max = Math.max(
    ...distributions.flatMap((distribution) => [
      distribution.lowCount,
      distribution.mediumCount,
      distribution.highCount,
      distribution.masteredCount,
    ]),
    1
  )

  const cells = [
    { key: "lowCount", label: "Bajo", color: "239 68 68" },
    { key: "mediumCount", label: "Medio", color: "245 158 11" },
    { key: "highCount", label: "Alto", color: "59 130 246" },
    { key: "masteredCount", label: "Dominado", color: "16 185 129" },
  ] as const

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Heatmap de mastery por cohorte</h2>
        <p className="mt-1 text-sm text-slate-600">
          Distribución por knowledge component y zona de dominio.
        </p>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Knowledge component</th>
              {cells.map((cell) => (
                <th key={cell.key} className="px-4 py-3 text-center">
                  {cell.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {distributions.map((distribution) => (
              <tr key={distribution.kcId}>
                <td className="px-4 py-4">
                  <p className="font-medium text-slate-900">{distribution.kcNameEs}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {distribution.kcName}
                  </p>
                </td>
                {cells.map((cell) => {
                  const value = distribution[cell.key]
                  const opacity = 0.14 + value / max * 0.56
                  return (
                    <td key={cell.key} className="px-4 py-4 text-center">
                      <div
                        className="rounded-2xl px-3 py-4 text-sm font-semibold text-slate-900"
                        style={{
                          backgroundColor: `rgb(${cell.color} / ${opacity})`,
                        }}
                      >
                        {value}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
