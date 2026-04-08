import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { PageShell } from "../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { MetricCard } from "../components/ui/metric-card"
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
      .catch(() => setError("No se pudieron cargar las métricas de cohorte."))
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageShell
      subtitle="Vista agregada de mastery BKT y adquisición de vocabulario para administradores."
      title="Cohort analytics"
    >
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : error || !mastery || !acquisition ? (
        <Alert variant="destructive">
          <AlertTitle>Error de carga</AlertTitle>
          <AlertDescription>{error ?? "No hay datos de cohorte disponibles."}</AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <MetricCard label="Usuarios analizados" value={mastery.userCount} />
            <MetricCard label="KCs trazados" value={mastery.distributions.length} />
            <MetricCard label="Semanas agregadas" value={acquisition.points.length} />
          </div>
          <CohortMasteryHeatmap distributions={mastery.distributions} />
          <CohortAcquisitionChart points={acquisition.points} />
        </>
      )}
    </PageShell>
  )
}
