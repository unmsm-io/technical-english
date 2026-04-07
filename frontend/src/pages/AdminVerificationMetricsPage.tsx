import { useEffect, useState } from "react"
import { AdminApi } from "../features/admin/AdminApi"
import { VerificationScoreBadge } from "../features/admin/components/VerificationScoreBadge"
import type { VerificationMetrics } from "../types/admin"

export function AdminVerificationMetricsPage() {
  const [metrics, setMetrics] = useState<VerificationMetrics | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    AdminApi.getMetrics().then(setMetrics).catch(() => {
      setError("No se pudieron cargar las métricas de verificación.")
    })
  }, [])

  if (error) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700 shadow-sm">{error}</div>
  }

  if (!metrics) {
    return <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500 shadow-sm">Cargando métricas...</div>
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Métricas de verificación</h1>
        <p className="text-sm text-gray-600">
          Vista resumida de aprobación, rechazos y volumen reciente del pipeline.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Generados" value={`${metrics.totalGenerated}`} />
        <MetricCard label="Pendientes" value={`${metrics.pendingCount}`} />
        <MetricCard label="Aprobados" value={`${metrics.approvedCount}`} />
        <MetricCard label="Últimas 24h" value={`${metrics.last24hCount}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Approval rate</h2>
            <VerificationScoreBadge score={metrics.approvalRate} />
          </div>
          <div className="mt-5 h-4 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${Math.round(metrics.approvalRate * 100)}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Score promedio del pipeline:{" "}
            {metrics.avgOverallScore !== null
              ? `${Math.round(metrics.avgOverallScore * 100)}%`
              : "sin datos"}
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Razones de rechazo</h2>
          <div className="mt-4 space-y-3">
            {Object.entries(metrics.rejectionsByReason).length === 0 ? (
              <p className="text-sm text-gray-500">No hay rechazos registrados.</p>
            ) : (
              Object.entries(metrics.rejectionsByReason).map(([reason, count]) => (
                <div key={reason} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-700">
                    <span>{reason}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-rose-500"
                      style={{
                        width: `${
                          (count /
                            Math.max(
                              1,
                              ...Object.values(metrics.rejectionsByReason)
                            )) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}
