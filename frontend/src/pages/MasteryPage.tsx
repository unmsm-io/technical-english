import { RefreshCcw, Radar } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router"
import { getUsers } from "../api/users"
import { PageShell } from "../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { EmptyState } from "../components/ui/empty-state"
import { MetricCard } from "../components/ui/metric-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { MasteryApi } from "../features/mastery/MasteryApi"
import { AcquisitionLineChart } from "../features/mastery/components/AcquisitionLineChart"
import { FlowStateCard } from "../features/mastery/components/FlowStateCard"
import { KcMasteryRow } from "../features/mastery/components/KcMasteryRow"
import { MasteryProgressRing } from "../features/mastery/components/MasteryProgressRing"
import { MasteryRadarChart } from "../features/mastery/components/MasteryRadarChart"
import { StabilityHeatmapChart } from "../features/mastery/components/StabilityHeatmapChart"
import type { AcquisitionRateResponse, FlowAlertResponse, MasteryRadarResponse, StabilityHeatmapResponse, User } from "../types"

export function MasteryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [users, setUsers] = useState<User[]>([])
  const [radar, setRadar] = useState<MasteryRadarResponse | null>(null)
  const [stability, setStability] = useState<StabilityHeatmapResponse | null>(null)
  const [acquisition, setAcquisition] = useState<AcquisitionRateResponse | null>(null)
  const [flowAlert, setFlowAlert] = useState<FlowAlertResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const selectedUserId = Number(searchParams.get("userId") ?? "") || null

  useEffect(() => {
    getUsers(0, 100)
      .then((page) => {
        setUsers(page.content)
        if (!selectedUserId && page.content[0]?.id) {
          const nextParams = new URLSearchParams(searchParams)
          nextParams.set("userId", String(page.content[0].id))
          setSearchParams(nextParams, { replace: true })
        }
      })
      .catch(() => setError("No se pudieron cargar los usuarios para mastery."))
  }, [searchParams, selectedUserId, setSearchParams])

  useEffect(() => {
    if (!selectedUserId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    Promise.all([
      MasteryApi.getStudentMasteryRadar(selectedUserId),
      MasteryApi.getStabilityHeatmap(selectedUserId),
      MasteryApi.getAcquisitionRate(selectedUserId),
      MasteryApi.getFlowAlert(selectedUserId),
    ])
      .then(([radarData, stabilityData, acquisitionData, flowData]) => {
        setRadar(radarData)
        setStability(stabilityData)
        setAcquisition(acquisitionData)
        setFlowAlert(flowData)
      })
      .catch(() => setError("No se pudo cargar el dashboard de dominio."))
      .finally(() => {
        setLoading(false)
        setRefreshing(false)
      })
  }, [selectedUserId])

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users]
  )

  const handleRefresh = async () => {
    if (!selectedUserId) return
    setRefreshing(true)
    try {
      await MasteryApi.recompute(selectedUserId)
      const [radarData, stabilityData, acquisitionData, flowData] = await Promise.all([
        MasteryApi.getStudentMasteryRadar(selectedUserId),
        MasteryApi.getStabilityHeatmap(selectedUserId),
        MasteryApi.getAcquisitionRate(selectedUserId),
        MasteryApi.getFlowAlert(selectedUserId),
      ])
      setRadar(radarData)
      setStability(stabilityData)
      setAcquisition(acquisitionData)
      setFlowAlert(flowData)
    } catch {
      setError("No se pudo recomputar el dominio del estudiante.")
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <PageShell
      actions={
        <>
          <div className="w-64">
            <Select
              onValueChange={(value) => {
                const nextParams = new URLSearchParams(searchParams)
                if (value && value !== "none") nextParams.set("userId", value)
                else nextParams.delete("userId")
                setSearchParams(nextParams, { replace: true })
              }}
              value={selectedUserId ? String(selectedUserId) : "none"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un usuario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Selecciona un usuario</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={String(user.id)}>
                    {user.firstName} {user.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button disabled={!selectedUserId || refreshing} onClick={handleRefresh} variant="outline">
            <RefreshCcw className="size-4" />
            {refreshing ? "Recalculando..." : "Recalcular"}
          </Button>
        </>
      }
      subtitle="Seguimiento de mastery BKT, estabilidad de repaso y estado de flow."
      title="Mi dominio"
    >
      {selectedUser ? (
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Estudiante seleccionado</p>
              <h2 className="text-2xl font-semibold tracking-tight">
                {selectedUser.firstName} {selectedUser.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {selectedUser.englishLevel ?? "Sin nivel"} · {selectedUser.email}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard label="Nivel" value={selectedUser.englishLevel ?? "-"} />
              <MetricCard label="Vocabulario" value={selectedUser.vocabularySize ?? 0} />
              <MetricCard label="Diagnóstico" value={selectedUser.diagnosticCompleted ? "Sí" : "No"} />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">Cargando dominio...</CardContent>
        </Card>
      ) : !selectedUserId ? (
        <EmptyState
          description="Selecciona un usuario para abrir su panel de dominio."
          icon={Radar}
          title="Sin estudiante activo"
        />
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Error de carga</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : radar && stability && acquisition && flowAlert ? (
        <>
          <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <MasteryProgressRing masteredCount={radar.masteredCount} totalKcs={radar.totalKcs} />
            <FlowStateCard flowState={flowAlert.flowState} />
          </section>

          <MasteryRadarChart entries={radar.kcs} />

          <section className="grid gap-6 xl:grid-cols-2">
            <StabilityHeatmapChart buckets={stability.buckets} />
            <AcquisitionLineChart points={acquisition.points} />
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Knowledge components</CardTitle>
              <CardDescription>Detalle del estado actual de cada component trazado por BKT.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {radar.kcs.length === 0 ? (
                <div className="px-6 pb-6">
                  <EmptyState
                    description="Este estudiante todavía no tiene suficientes interacciones para mostrar KCs."
                    icon={Radar}
                    title="Sin knowledge components"
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Knowledge component</TableHead>
                        <TableHead>P(L)</TableHead>
                        <TableHead>Respuestas</TableHead>
                        <TableHead>Acierto</TableHead>
                        <TableHead>Mastery</TableHead>
                        <TableHead className="text-right">Detalle</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {radar.kcs.map((entry) => (
                        <KcMasteryRow entry={entry} key={entry.kcId} userId={selectedUserId} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <EmptyState
          description="Todavía no hay suficiente actividad para mostrar métricas de mastery."
          icon={Radar}
          title="Sin datos de dominio"
        />
      )}
    </PageShell>
  )
}
