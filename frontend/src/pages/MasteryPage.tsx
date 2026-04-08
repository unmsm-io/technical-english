import { Loader2, RefreshCcw } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router"
import { getUsers } from "../api/users"
import { MasteryApi } from "../features/mastery/MasteryApi"
import { AcquisitionLineChart } from "../features/mastery/components/AcquisitionLineChart"
import { FlowStateCard } from "../features/mastery/components/FlowStateCard"
import { KcMasteryRow } from "../features/mastery/components/KcMasteryRow"
import { MasteryProgressRing } from "../features/mastery/components/MasteryProgressRing"
import { MasteryRadarChart } from "../features/mastery/components/MasteryRadarChart"
import { StabilityHeatmapChart } from "../features/mastery/components/StabilityHeatmapChart"
import type {
  AcquisitionRateResponse,
  FlowAlertResponse,
  MasteryRadarResponse,
  StabilityHeatmapResponse,
  User,
} from "../types"

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
      .catch(() => {
        setError("No se pudieron cargar los usuarios para mastery.")
      })
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
      .catch(() => {
        setError("No se pudo cargar el dashboard de dominio.")
      })
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
    if (!selectedUserId) {
      return
    }

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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">Mi dominio</h1>
          <p className="text-sm text-slate-600">
            Seguimiento de mastery BKT, estabilidad de repaso y estado de flow.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            aria-label="Usuario para mastery"
            value={selectedUserId ?? ""}
            onChange={(event) => {
              const nextParams = new URLSearchParams(searchParams)
              if (event.target.value) {
                nextParams.set("userId", event.target.value)
              } else {
                nextParams.delete("userId")
              }
              setSearchParams(nextParams, { replace: true })
            }}
            className="min-w-64 rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
          >
            <option value="">Selecciona un usuario</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={!selectedUserId || refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Recalcular
          </button>
        </div>
      </div>

      {selectedUser ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-600">Estudiante seleccionado</p>
          <p className="mt-2 text-xl font-semibold text-slate-950">
            {selectedUser.firstName} {selectedUser.lastName}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {selectedUser.englishLevel ?? "Sin nivel"} · {selectedUser.email}
          </p>
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 shadow-sm">
          <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
        </div>
      ) : !selectedUserId ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
          Selecciona un usuario para abrir su panel de dominio.
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {error}
        </div>
      ) : radar && stability && acquisition && flowAlert ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <MasteryProgressRing
              masteredCount={radar.masteredCount}
              totalKcs={radar.totalKcs}
            />
            <FlowStateCard flowState={flowAlert.flowState} />
          </div>

          <MasteryRadarChart entries={radar.kcs} />

          <div className="grid gap-6 xl:grid-cols-2">
            <StabilityHeatmapChart buckets={stability.buckets} />
            <AcquisitionLineChart points={acquisition.points} />
          </div>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Knowledge components</h2>
              <p className="mt-1 text-sm text-slate-600">
                Detalle del estado actual de cada component trazado por BKT.
              </p>
            </div>
            {radar.kcs.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500">
                Este estudiante aún no tiene datos suficientes para mostrar KCs.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Knowledge component</th>
                      <th className="px-5 py-3">P(L)</th>
                      <th className="px-5 py-3">Respuestas</th>
                      <th className="px-5 py-3">Acierto</th>
                      <th className="px-5 py-3">Mastery</th>
                      <th className="px-5 py-3 text-right">Detalle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {radar.kcs.map((entry) => (
                      <KcMasteryRow key={entry.kcId} entry={entry} userId={selectedUserId} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
          No hay datos de mastery disponibles para este estudiante.
        </div>
      )}
    </div>
  )
}
