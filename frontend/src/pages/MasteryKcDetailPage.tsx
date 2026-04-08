import { Loader2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router"
import { getUsers } from "../api/users"
import { MasteryApi } from "../features/mastery/MasteryApi"
import type { KcMasteryDetailResponse, User } from "../types"

export function MasteryKcDetailPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const [users, setUsers] = useState<User[]>([])
  const [detail, setDetail] = useState<KcMasteryDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = Number(searchParams.get("userId") ?? "")
  const kcId = Number(id ?? "")

  useEffect(() => {
    getUsers(0, 100).then((page) => setUsers(page.content)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!userId || !kcId) {
      setLoading(false)
      setError("Faltan parámetros para cargar el detalle de mastery.")
      return
    }

    setLoading(true)
    setError(null)

    MasteryApi.getKcDetail(userId, kcId)
      .then(setDetail)
      .catch(() => {
        setError("No se pudo cargar el detalle del knowledge component.")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [kcId, userId])

  const user = useMemo(
    () => users.find((candidate) => candidate.id === userId) ?? null,
    [userId, users]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 shadow-sm">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error ?? "No se encontró el detalle solicitado."}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">
            {detail.knowledgeComponent.nameEs}
          </h1>
          <p className="text-sm text-slate-600">{detail.knowledgeComponent.description}</p>
        </div>
        <Link
          to={userId ? `/mastery?userId=${userId}` : "/mastery"}
          className="inline-flex rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Volver a Mi dominio
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Knowledge component</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {detail.knowledgeComponent.name}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {detail.knowledgeComponent.category} · {detail.knowledgeComponent.cefrLevel}
              </p>
            </div>
            <div className="rounded-2xl bg-blue-50 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-wide text-blue-700">P(L) actual</p>
              <p className="mt-1 text-3xl font-semibold text-blue-950">
                {Math.round(detail.state.pLearned * 100)}%
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Respuestas" value={`${detail.state.totalResponses}`} />
            <MetricCard label="Correctas" value={`${detail.state.correctResponses}`} />
            <MetricCard
              label="Última respuesta"
              value={
                detail.state.lastResponseAt
                  ? new Date(detail.state.lastResponseAt).toLocaleDateString()
                  : "Sin actividad"
              }
            />
            <MetricCard
              label="Mastery"
              value={
                detail.state.masteredAt
                  ? new Date(detail.state.masteredAt).toLocaleDateString()
                  : "Aún no"
              }
            />
          </div>

          {user ? (
            <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              Seguimiento de <span className="font-semibold">{user.firstName} {user.lastName}</span>.
            </div>
          ) : null}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Items relacionados</h2>
          <div className="mt-4 space-y-3">
            {detail.relatedItems.length === 0 ? (
              <p className="text-sm text-slate-500">No hay mappings asociados.</p>
            ) : (
              detail.relatedItems.map((item) => (
                <div
                  key={`${item.itemType}-${item.itemId}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-slate-900">{item.itemType}</span>
                    <span className="text-sm text-slate-600">ID {item.itemId}</span>
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                    Peso {item.weight.toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Historial reciente</h2>
        <p className="mt-1 text-sm text-slate-600">
          Últimos {detail.history.length} registros del knowledge component.
        </p>
        {detail.history.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            Aún no hay logs para este knowledge component.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {detail.history.map((entry) => (
              <div
                key={entry.logId}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {entry.itemType}
                      </span>
                      <span className="text-sm text-slate-700">Item {entry.itemId}</span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          entry.correct
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {entry.correct ? "Correcto" : "Incorrecto"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {new Date(entry.respondedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="grid gap-2 text-sm text-slate-700 sm:text-right">
                    <span>P(L) antes: {Math.round(entry.pLearnedBefore * 100)}%</span>
                    <span className="font-semibold text-slate-950">
                      P(L) después: {Math.round(entry.pLearnedAfter * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  )
}
