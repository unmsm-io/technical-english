import { Loader2 } from "lucide-react"
import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Link, useParams } from "react-router"
import { getUsers } from "../api/users"
import { PilotApi } from "../features/pilot/PilotApi"
import { CohortMetricCard } from "../features/pilot/components/CohortMetricCard"
import { CohortStateBadge } from "../features/pilot/components/CohortStateBadge"
import { EnrollmentTable } from "../features/pilot/components/EnrollmentTable"
import type { User } from "../types"
import type { CohortState, PilotCohort, PilotEnrollment } from "../types/pilot"

const nextStateByCurrent: Partial<Record<CohortState, CohortState>> = {
  ENROLLING: "PRE_TEST_PHASE",
  PRE_TEST_PHASE: "INTERVENTION_PHASE",
  INTERVENTION_PHASE: "POST_TEST_PHASE",
  POST_TEST_PHASE: "RESULTS_AVAILABLE",
  RESULTS_AVAILABLE: "ARCHIVED",
}

export function AdminPilotCohortDetailPage() {
  const params = useParams()
  const cohortId = Number(params.id)
  const [cohort, setCohort] = useState<PilotCohort | null>(null)
  const [enrollments, setEnrollments] = useState<PilotEnrollment[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      PilotApi.getCohort(cohortId),
      PilotApi.getEnrollments(cohortId),
      getUsers(0, 100),
    ])
      .then(([cohortData, enrollmentData, userPage]) => {
        setCohort(cohortData)
        setEnrollments(enrollmentData)
        setUsers(userPage.content.filter((user) => user.role === "STUDENT"))
      })
      .catch(() => {
        setError("No se pudo cargar la cohorte piloto.")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [cohortId])

  useEffect(() => {
    if (selectedUserId !== 0 || users.length === 0) {
      return
    }
    const availableUser = users.find(
      (user) => !enrollments.some((enrollment) => enrollment.userId === user.id)
    )
    if (availableUser) {
      setSelectedUserId(availableUser.id)
    }
  }, [users, enrollments, selectedUserId])

  const availableUsers = useMemo(
    () => users.filter((user) => !enrollments.some((enrollment) => enrollment.userId === user.id)),
    [users, enrollments]
  )

  async function handleEnroll(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedUserId) {
      return
    }
    setBusyAction("enroll")
    setError(null)
    try {
      const enrollment = await PilotApi.enrollUser(cohortId, selectedUserId)
      setEnrollments((current) => [...current, enrollment])
      const refreshedCohort = await PilotApi.getCohort(cohortId)
      setCohort(refreshedCohort)
    } catch {
      setError("No se pudo inscribir al estudiante en la cohorte.")
    } finally {
      setBusyAction(null)
    }
  }

  async function handleAdvance() {
    if (!cohort) {
      return
    }
    const nextState = nextStateByCurrent[cohort.state]
    if (!nextState) {
      return
    }
    setBusyAction("advance")
    setError(null)
    try {
      const updated = await PilotApi.advancePhase(cohort.id, nextState)
      setCohort(updated)
    } catch {
      setError("No se pudo avanzar la fase de la cohorte.")
    } finally {
      setBusyAction(null)
    }
  }

  async function handleTriggerPostTest() {
    if (!cohort) {
      return
    }
    setBusyAction("post-test")
    setError(null)
    try {
      const updated = await PilotApi.triggerPostTest(cohort.id)
      const refreshedEnrollments = await PilotApi.getEnrollments(cohort.id)
      setCohort(updated)
      setEnrollments(refreshedEnrollments)
    } catch {
      setError("No se pudo generar el post-test de la cohorte.")
    } finally {
      setBusyAction(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 shadow-sm">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error && !cohort) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error}
      </div>
    )
  }

  if (!cohort) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
        No se encontró la cohorte solicitada.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">{cohort.name}</h1>
            <CohortStateBadge state={cohort.state} />
          </div>
          <p className="text-sm text-slate-600">{cohort.description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleAdvance}
            disabled={!nextStateByCurrent[cohort.state] || busyAction !== null}
            className="inline-flex rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {busyAction === "advance" ? "Actualizando..." : "Avanzar fase"}
          </button>
          <button
            type="button"
            onClick={handleTriggerPostTest}
            disabled={busyAction !== null}
            className="inline-flex rounded-2xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {busyAction === "post-test" ? "Generando..." : "Disparar post-test"}
          </button>
          <Link
            to={`/admin/pilot/cohorts/${cohort.id}/results`}
            className="inline-flex rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Ver resultados
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <CohortMetricCard
          label="Inscritos"
          value={`${cohort.enrolledUserCount}/${cohort.targetUserCount}`}
        />
        <CohortMetricCard
          label="Primera fase"
          value={cohort.enrollmentStartedAt ? new Date(cohort.enrollmentStartedAt).toLocaleDateString() : "Pendiente"}
        />
        <CohortMetricCard
          label="Intervención"
          value={cohort.interventionStartedAt ? new Date(cohort.interventionStartedAt).toLocaleDateString() : "Pendiente"}
        />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-medium text-slate-900">Inscribir estudiante</h2>
          <p className="text-sm text-slate-500">
            El enrolamiento genera instrumentos de diagnóstico y summatives de pre-test.
          </p>
        </div>
        <form className="mt-6 flex flex-col gap-4 md:flex-row" onSubmit={handleEnroll}>
          <select
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(Number(event.target.value))}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-400"
          >
            {availableUsers.length === 0 ? (
              <option value={0}>No hay estudiantes disponibles</option>
            ) : (
              availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))
            )}
          </select>
          <button
            type="submit"
            disabled={availableUsers.length === 0 || busyAction !== null}
            className="inline-flex rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {busyAction === "enroll" ? "Inscribiendo..." : "Inscribir"}
          </button>
        </form>
        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-medium text-slate-900">Enrollment table</h2>
          <span className="text-sm text-slate-500">{enrollments.length} registros</span>
        </div>
        <EnrollmentTable enrollments={enrollments} users={users} />
      </section>
    </div>
  )
}
