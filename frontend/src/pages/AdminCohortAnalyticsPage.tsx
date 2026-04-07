import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { CohortApi } from "../features/cohort/CohortApi"
import { CohortAcquisitionChart } from "../features/cohort/components/CohortAcquisitionChart"
import { CohortMasteryHeatmap } from "../features/cohort/components/CohortMasteryHeatmap"
import type { CohortAcquisitionResponse, CohortMasteryResponse } from "../types"

export function AdminCohortAnalyticsPage() {
  const [mastery, setMastery] = useState<CohortMasteryResponse | null>(null)
  const [acquisition, setAcquisition] = useState<CohortAcquisitionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([CohortApi.getMastery(), CohortApi.getAcquisition()])
      .then(([masteryData, acquisitionData]) => {
        setMastery(masteryData)
        setAcquisition(acquisitionData)
      })
      .catch(() => {
        setError("No se pudieron cargar las métricas de cohorte.")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 shadow-sm">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !mastery || !acquisition) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error ?? "No hay datos de cohorte disponibles."}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Cohort Analytics</h1>
        <p className="text-sm text-slate-600">
          Vista agregada de mastery BKT y adquisición de vocabulario para administradores.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <MetricCard label="Usuarios analizados" value={`${mastery.userCount}`} />
        <MetricCard label="KCs trazados" value={`${mastery.distributions.length}`} />
        <MetricCard label="Semanas agregadas" value={`${acquisition.points.length}`} />
      </div>

      <CohortMasteryHeatmap distributions={mastery.distributions} />
      <CohortAcquisitionChart points={acquisition.points} />
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  )
}
