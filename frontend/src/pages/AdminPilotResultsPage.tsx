import { Loader2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router"
import { getUsers } from "../api/users"
import { PilotApi } from "../features/pilot/PilotApi"
import { CohenDChart } from "../features/pilot/components/CohenDChart"
import { CohortMetricCard } from "../features/pilot/components/CohortMetricCard"
import type { User } from "../types"
import type { PilotResultsResponse } from "../types/pilot"

function formatMetric(value: number | null, suffix = "") {
  if (value === null) {
    return "N/D"
  }
  return `${value.toFixed(2)}${suffix}`
}

export function AdminPilotResultsPage() {
  const params = useParams()
  const cohortId = Number(params.id)
  const [results, setResults] = useState<PilotResultsResponse | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([PilotApi.getResults(cohortId), getUsers(0, 100)])
      .then(([resultsData, userPage]) => {
        setResults(resultsData)
        setUsers(userPage.content)
      })
      .catch(() => {
        setError("No se pudieron calcular los resultados del piloto.")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [cohortId])

  const userMap = useMemo(
    () => new Map(users.map((user) => [user.id, `${user.firstName} ${user.lastName}`])),
    [users]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 shadow-sm">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !results) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error ?? "No hay resultados disponibles para esta cohorte."}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">{results.cohortName}</h1>
        <p className="text-sm text-slate-600">
          Resultados agregados del piloto con deltas pre/post y tamaños de efecto.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CohortMetricCard label="Inscritos" value={`${results.enrolledCount}`} />
        <CohortMetricCard label="Completados" value={`${results.completedCount}`} />
        <CohortMetricCard
          label="Δ vocabulario"
          value={formatMetric(results.metrics.vocabularySizeDelta)}
        />
        <CohortMetricCard
          label="Δ comprensión"
          value={formatMetric(results.metrics.comprehensionScoreDelta, " pts")}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-lg font-medium text-slate-900">Métricas del piloto</h2>
            <p className="text-sm text-slate-500">
              Lectura rápida para el reporte local del estudio.
            </p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Aceptación de rewrite</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">
                {formatMetric(results.metrics.rewriteAcceptanceRate, "%")}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Retorno dentro de 7 días</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">
                {formatMetric(results.metrics.return7dRate, "%")}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Tiempo a primera acción</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">
                {formatMetric(results.metrics.avgTimeToFirstActionMinutes, " min")}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Pass rate summative</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">
                {formatMetric(results.metrics.summativePassRate, "%")}
              </p>
            </div>
          </div>
        </section>

        <CohenDChart metrics={results.metrics} />
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-medium text-slate-900">Desglose por estudiante</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Estudiante</th>
                <th className="px-4 py-3 font-medium">Δ vocabulario</th>
                <th className="px-4 py-3 font-medium">Δ comprensión</th>
                <th className="px-4 py-3 font-medium">Rewrite</th>
                <th className="px-4 py-3 font-medium">Primera acción</th>
                <th className="px-4 py-3 font-medium">Retornó</th>
                <th className="px-4 py-3 font-medium">Pass rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.perUserBreakdown.map((item) => (
                <tr key={item.userId}>
                  <td className="px-4 py-4 font-medium text-slate-900">
                    {userMap.get(item.userId) ?? `Usuario ${item.userId}`}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{formatMetric(item.vocabularySizeDelta)}</td>
                  <td className="px-4 py-4 text-slate-600">{formatMetric(item.comprehensionScoreDelta)}</td>
                  <td className="px-4 py-4 text-slate-600">{formatMetric(item.rewriteAcceptanceRate, "%")}</td>
                  <td className="px-4 py-4 text-slate-600">{formatMetric(item.timeToFirstActionMinutes, " min")}</td>
                  <td className="px-4 py-4 text-slate-600">{item.returnedWithin7Days ? "Sí" : "No"}</td>
                  <td className="px-4 py-4 text-slate-600">{formatMetric(item.postSummativePassRate, "%")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
