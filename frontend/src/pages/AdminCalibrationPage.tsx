import { useEffect, useState } from "react"
import { PageShell } from "../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Button } from "../components/ui/button"
import { MetricCard } from "../components/ui/metric-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { AdminApi } from "../features/admin/AdminApi"
import { DifficultyBadge } from "../features/admin/components/DifficultyBadge"
import type { CalibratedItem, CalibrationRunResult, CalibrationStats } from "../types/admin"

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
    <PageShell
      actions={<Button onClick={runCalibration} variant="outline">{running ? "Ejecutando..." : "Ejecutar calibración"}</Button>}
      subtitle="Dificultad Rasch, conteos por estado y corrida manual de calibración."
      title="Calibración IRT"
    >
      {runResult ? (
        <Alert>
          <AlertTitle>Última corrida manual</AlertTitle>
          <AlertDescription>{runResult.itemsCalibrated} calibrados, {runResult.itemsConverged} convergidos, {runResult.durationMs} ms.</AlertDescription>
        </Alert>
      ) : null}

      {loading ? (
        <div className="text-sm text-muted-foreground">Cargando calibración...</div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Error de carga</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Items totales" value={stats?.totalItems ?? 0} />
            <MetricCard label="Theta promedio" value={formatValue(stats?.avgAbilityTheta)} />
            <MetricCard label="Dificultad promedio" value={formatValue(stats?.avgDifficulty)} />
            <MetricCard label="Respuestas totales" value={stats?.totalResponses ?? 0} />
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Pregunta</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Dificultad</TableHead>
                  <TableHead>a</TableHead>
                  <TableHead>Respuestas</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold">{item.id}</TableCell>
                    <TableCell>{item.questionPreview}</TableCell>
                    <TableCell>{item.cefrLevel}</TableCell>
                    <TableCell><DifficultyBadge difficulty={item.difficulty} /></TableCell>
                    <TableCell>{item.discrimination !== null ? item.discrimination.toFixed(2) : "—"}</TableCell>
                    <TableCell>{item.responseCount ?? 0}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </PageShell>
  )
}

function formatValue(value: number | null | undefined) {
  if (value === null || value === undefined) return "—"
  return value.toFixed(2)
}
