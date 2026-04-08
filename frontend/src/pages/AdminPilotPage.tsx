import { Loader2 } from "lucide-react"
import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Link } from "react-router"
import { getUsers } from "../api/users"
import { PilotApi } from "../features/pilot/PilotApi"
import { CohortMetricCard } from "../features/pilot/components/CohortMetricCard"
import { CohortStateBadge } from "../features/pilot/components/CohortStateBadge"
import type { User } from "../types"
import type { CreateCohortRequest, PilotCohort } from "../types/pilot"

const initialForm = {
  name: "",
  description: "",
  targetUserCount: 12,
  createdBy: 0,
}

export function AdminPilotPage() {
  const [cohorts, setCohorts] = useState<PilotCohort[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<CreateCohortRequest>(initialForm)

  useEffect(() => {
    Promise.all([PilotApi.listCohorts(), getUsers(0, 100)])
      .then(([cohortData, userPage]) => {
        const adminUsers = userPage.content.filter((user) => user.role === "ADMIN")
        setCohorts(cohortData)
        setUsers(adminUsers)
        if (adminUsers.length > 0) {
          setForm((current) => ({
            ...current,
            createdBy: current.createdBy || adminUsers[0].id,
          }))
        }
      })
      .catch(() => {
        setError("No se pudieron cargar las cohortes del piloto.")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const activeCount = useMemo(
    () => cohorts.filter((cohort) => cohort.state !== "ARCHIVED").length,
    [cohorts]
  )
  const resultsCount = useMemo(
    () => cohorts.filter((cohort) => cohort.state === "RESULTS_AVAILABLE").length,
    [cohorts]
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const created = await PilotApi.createCohort(form)
      setCohorts((current) => [created, ...current])
      setForm((current) => ({
        ...current,
        name: "",
        description: "",
        targetUserCount: current.targetUserCount,
      }))
    } catch {
      setError("No se pudo crear la cohorte piloto.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 shadow-sm">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Pilot Studies</h1>
        <p className="text-sm text-slate-600">
          Gestión local de cohortes, enrolamiento y medición pre/post para el piloto.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <CohortMetricCard label="Cohortes activas" value={`${activeCount}`} />
        <CohortMetricCard label="Con resultados" value={`${resultsCount}`} />
        <CohortMetricCard
          label="Capacidad objetivo"
          value={`${cohorts.reduce((total, cohort) => total + cohort.targetUserCount, 0)}`}
        />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-medium text-slate-900">Crear cohorte</h2>
          <p className="text-sm text-slate-500">
            Registra el estudio y deja listo el flujo para enrolar estudiantes.
          </p>
        </div>
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm text-slate-700">
            <span>Nombre</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 transition focus:border-blue-400"
              placeholder="Piloto Abril 2026"
              required
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span>Responsable</span>
            <select
              value={form.createdBy}
              onChange={(event) =>
                setForm((current) => ({ ...current, createdBy: Number(event.target.value) }))
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-400"
              required
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
            <span>Descripción</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-400"
              placeholder="Seguimiento local de escritura técnica con pre-test, intervención y post-test."
              required
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span>Tamaño objetivo</span>
            <input
              type="number"
              min={1}
              value={form.targetUserCount}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  targetUserCount: Number(event.target.value),
                }))
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-400"
              required
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting || users.length === 0}
              className="inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {submitting ? "Creando..." : "Crear cohorte"}
            </button>
          </div>
        </form>
        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-medium text-slate-900">Cohortes registradas</h2>
          <span className="text-sm text-slate-500">{cohorts.length} cohortes</span>
        </div>
        {cohorts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            No hay cohortes todavía.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {cohorts.map((cohort) => (
              <article
                key={cohort.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-slate-900">{cohort.name}</h3>
                    <p className="text-sm text-slate-600">{cohort.description}</p>
                  </div>
                  <CohortStateBadge state={cohort.state} />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Inscritos</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-950">
                      {cohort.enrolledUserCount}/{cohort.targetUserCount}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Inicio</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {cohort.enrollmentStartedAt
                        ? new Date(cohort.enrollmentStartedAt).toLocaleDateString()
                        : "Pendiente"}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    to={`/admin/pilot/cohorts/${cohort.id}`}
                    className="inline-flex rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Ver cohorte
                  </Link>
                  <Link
                    to={`/admin/pilot/cohorts/${cohort.id}/results`}
                    className="inline-flex rounded-2xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    Ver resultados
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
