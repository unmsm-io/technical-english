import { useEffect, useState } from "react"
import { PageShell } from "../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { MetricCard } from "../components/ui/metric-card"
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
    return (
      <PageShell subtitle="No fue posible cargar el pipeline." title="Métricas de verificación">
        <Alert variant="destructive">
          <AlertTitle>Error de carga</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </PageShell>
    )
  }

  if (!metrics) {
    return (
      <PageShell subtitle="Cargando vista agregada del pipeline." title="Métricas de verificación">
        <Card><CardContent className="py-8 text-sm text-muted-foreground">Cargando métricas...</CardContent></Card>
      </PageShell>
    )
  }

  const maxRejections = Math.max(1, ...Object.values(metrics.rejectionsByReason))

  return (
    <PageShell
      subtitle="Aprobación, rechazos y volumen reciente del pipeline multi-agente."
      title="Métricas de verificación"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Generados" value={metrics.totalGenerated} />
        <MetricCard label="Pendientes" value={metrics.pendingCount} />
        <MetricCard label="Aprobados" value={metrics.approvedCount} />
        <MetricCard label="Últimas 24h" value={metrics.last24hCount} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle>Approval rate</CardTitle>
            <VerificationScoreBadge score={metrics.approvalRate} />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-4 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground"
                style={{ width: `${Math.round(metrics.approvalRate * 100)}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Score promedio del pipeline: {metrics.avgOverallScore !== null ? `${Math.round(metrics.avgOverallScore * 100)}%` : "sin datos"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Razones de rechazo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(metrics.rejectionsByReason).length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay rechazos registrados.</p>
            ) : (
              Object.entries(metrics.rejectionsByReason).map(([reason, count]) => (
                <div className="space-y-2" key={reason}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{reason}</span>
                    <span className="tabular-nums">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground"
                      style={{ width: `${(count / maxRejections) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
