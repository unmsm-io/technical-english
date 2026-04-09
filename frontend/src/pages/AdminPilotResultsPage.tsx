import { Loader2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router"
import { getUsers } from "../api/users"
import { PageShell } from "../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
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
      .catch(() => setError("No se pudieron calcular los resultados del piloto."))
      .finally(() => setLoading(false))
  }, [cohortId])

  const userMap = useMemo(
    () => new Map(users.map((user) => [user.id, `${user.firstName} ${user.lastName}`])),
    [users]
  )

  return (
    <PageShell
      subtitle="Deltas pre/post y tamaños de efecto consolidados para la cohorte."
      title="Resultados del piloto"
    >
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : error || !results ? (
        <Alert variant="destructive">
          <AlertTitle>Error de carga</AlertTitle>
          <AlertDescription>{error ?? "No hay resultados disponibles para esta cohorte."}</AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <CohortMetricCard label="Inscritos" value={`${results.enrolledCount}`} />
            <CohortMetricCard label="Completados" value={`${results.completedCount}`} />
            <CohortMetricCard label="Δ vocabulario" value={formatMetric(results.metrics.vocabularySizeDelta)} />
            <CohortMetricCard label="Δ comprensión" value={formatMetric(results.metrics.comprehensionScoreDelta, " pts")} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Métricas del piloto</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <p className="text-sm text-muted-foreground">Aceptación de rewrite</p>
                  <p className="mt-1 text-2xl font-semibold">{formatMetric(results.metrics.rewriteAcceptanceRate, "%")}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <p className="text-sm text-muted-foreground">Retorno dentro de 7 días</p>
                  <p className="mt-1 text-2xl font-semibold">{formatMetric(results.metrics.return7dRate, "%")}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <p className="text-sm text-muted-foreground">Tiempo a primera acción</p>
                  <p className="mt-1 text-2xl font-semibold">{formatMetric(results.metrics.avgTimeToFirstActionMinutes, " min")}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <p className="text-sm text-muted-foreground">Pass rate summative</p>
                  <p className="mt-1 text-2xl font-semibold">{formatMetric(results.metrics.summativePassRate, "%")}</p>
                </div>
              </CardContent>
            </Card>

            <CohenDChart metrics={results.metrics} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Desglose por estudiante</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Δ vocabulario</TableHead>
                      <TableHead>Δ comprensión</TableHead>
                      <TableHead>Rewrite</TableHead>
                      <TableHead>Primera acción</TableHead>
                      <TableHead>Retornó</TableHead>
                      <TableHead>Pass rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.perUserBreakdown.map((item) => (
                      <TableRow key={item.userId}>
                        <TableCell className="font-medium">{userMap.get(item.userId) ?? `Usuario ${item.userId}`}</TableCell>
                        <TableCell>{formatMetric(item.vocabularySizeDelta)}</TableCell>
                        <TableCell>{formatMetric(item.comprehensionScoreDelta)}</TableCell>
                        <TableCell>{formatMetric(item.rewriteAcceptanceRate, "%")}</TableCell>
                        <TableCell>{formatMetric(item.timeToFirstActionMinutes, " min")}</TableCell>
                        <TableCell>{item.returnedWithin7Days ? "Sí" : "No"}</TableCell>
                        <TableCell>{formatMetric(item.postSummativePassRate, "%")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </PageShell>
  )
}
