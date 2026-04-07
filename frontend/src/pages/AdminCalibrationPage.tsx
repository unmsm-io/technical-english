import { useEffect, useState } from "react"
import { AdminApi } from "../features/admin/AdminApi"
import { DifficultyBadge } from "../features/admin/components/DifficultyBadge"
import type {
  CalibratedItem,
  CalibrationRunResult,
  CalibrationStats,
} from "../types/admin"

export function AdminCalibrationPage() {
  const [stats, setStats] = useState<CalibrationStats | null>(null)
  const [items, setItems] = useState<CalibratedItem[]>([])
  const [runResult, setRunResult] = useState<CalibrationRunResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsResponse, itemsResponse] = await Promise.all([
        AdminApi.getCalibrationStats(),
        AdminApi.getCalibratedItems(),
      ])
      setStats(statsResponse)
      setItems(itemsResponse)
    } catch {
      setError("No se pudo cargar la calibración.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData().catch(() => {})
  }, [])

  const runCalibration = async () => {
    setRunning(true)
    try {
      const result = await AdminApi.runCalibration()
      setRunResult(result)
      await loadData()
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Calibración IRT</h1>
          <p className="mt-1 text-sm text-gray-600">
            Revisa dificultad Rasch, conteos por estado y ejecuta calibración manual.
          </p>
        </div>
        <button
          type="button"
          onClick={runCalibration}
          disabled={running}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {running ? "Ejecutando..." : "Ejecutar calibración ahora"}
        </button>
      </div>

      {runResult ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 shadow-sm">
          Última corrida manual: {runResult.itemsCalibrated} calibrados,{" "}
          {runResult.itemsConverged} convergidos, {runResult.durationMs} ms.
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500 shadow-sm">
          Cargando calibración...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700 shadow-sm">
          {error}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Items totales" value={`${stats?.totalItems ?? 0}`} />
            <StatCard label="Theta promedio" value={formatValue(stats?.avgAbilityTheta)} />
            <StatCard label="Dificultad promedio" value={formatValue(stats?.avgDifficulty)} />
            <StatCard label="Respuestas totales" value={`${stats?.totalResponses ?? 0}`} />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Estados de calibración</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {Object.entries(stats?.byStatus ?? {}).map(([status, count]) => (
                <div key={status} className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">{status}</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">{count}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Próxima calibración automática: 3:30 AM. Última corrida:{" "}
              {stats?.lastCalibrationAt
                ? new Date(stats.lastCalibrationAt).toLocaleString()
                : "sin datos"}
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Pregunta</th>
                    <th className="px-4 py-3">Nivel</th>
                    <th className="px-4 py-3">Dificultad</th>
                    <th className="px-4 py-3">a</th>
                    <th className="px-4 py-3">Respuestas</th>
                    <th className="px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-semibold text-gray-900">{item.id}</td>
                      <td className="px-4 py-3 text-gray-700">{item.questionPreview}</td>
                      <td className="px-4 py-3 text-gray-600">{item.cefrLevel}</td>
                      <td className="px-4 py-3">
                        <DifficultyBadge difficulty={item.difficulty} />
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.discrimination !== null ? item.discrimination.toFixed(2) : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{item.responseCount ?? 0}</td>
                      <td className="px-4 py-3 text-gray-600">{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}

function formatValue(value: number | null | undefined) {
  if (value === null || value === undefined) return "—"
  return value.toFixed(2)
}
