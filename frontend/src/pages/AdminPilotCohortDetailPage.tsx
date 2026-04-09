import { Loader2 } from "lucide-react"
import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Link, useParams } from "react-router"
import { getUsers } from "../api/users"
import { PageShell } from "../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Button } from "../components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
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
    Promise.all([PilotApi.getCohort(cohortId), PilotApi.getEnrollments(cohortId), getUsers(0, 100)])
      .then(([cohortData, enrollmentData, userPage]) => {
        setCohort(cohortData)
        setEnrollments(enrollmentData)
        setUsers(userPage.content.filter((user) => user.role === "STUDENT"))
      })
      .catch(() => setError("No se pudo cargar la cohorte piloto."))
      .finally(() => setLoading(false))
  }, [cohortId])

  useEffect(() => {
    if (selectedUserId !== 0 || users.length === 0) return
    const availableUser = users.find((user) => !enrollments.some((enrollment) => enrollment.userId === user.id))
    if (availableUser) setSelectedUserId(availableUser.id)
  }, [users, enrollments, selectedUserId])

  const availableUsers = useMemo(() => users.filter((user) => !enrollments.some((enrollment) => enrollment.userId === user.id)), [users, enrollments])

  async function handleEnroll(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedUserId) return
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
    if (!cohort) return
    const nextState = nextStateByCurrent[cohort.state]
    if (!nextState) return
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
    if (!cohort) return
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
    return <div className="flex items-center justify-center py-16"><Loader2 className="size-6 animate-spin" /></div>
  }

  if (error && !cohort) {
    return <PageShell subtitle="No fue posible cargar la cohorte." title="Cohorte"><Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></PageShell>
  }

  if (!cohort) {
    return <PageShell subtitle="No se encontró la cohorte." title="Cohorte"><div className="text-sm text-muted-foreground">No encontrada.</div></PageShell>
  }

  return (
    <PageShell
      actions={<CohortStateBadge state={cohort.state} />}
      subtitle={cohort.description}
      title={cohort.name}
    >
      <div className="flex flex-wrap gap-3">
        <Button disabled={!nextStateByCurrent[cohort.state] || busyAction !== null} onClick={handleAdvance} variant="outline">
          {busyAction === "advance" ? "Actualizando..." : "Avanzar fase"}
        </Button>
        <Button disabled={busyAction !== null} onClick={handleTriggerPostTest}>
          {busyAction === "post-test" ? "Generando..." : "Disparar post-test"}
        </Button>
        <Button asChild variant="outline"><Link to={`/admin/pilot/cohorts/${cohort.id}/results`}>Ver resultados</Link></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <CohortMetricCard label="Inscritos" value={`${cohort.enrolledUserCount}/${cohort.targetUserCount}`} />
        <CohortMetricCard label="Primera fase" value={cohort.enrollmentStartedAt ? new Date(cohort.enrollmentStartedAt).toLocaleDateString() : "Pendiente"} />
        <CohortMetricCard label="Intervención" value={cohort.interventionStartedAt ? new Date(cohort.interventionStartedAt).toLocaleDateString() : "Pendiente"} />
      </div>

      <form className="flex flex-col gap-4 md:flex-row" onSubmit={handleEnroll}>
        <div className="flex-1">
          <Select onValueChange={(value) => setSelectedUserId(Number(value))} value={selectedUserId ? String(selectedUserId) : "0"}>
            <SelectTrigger><SelectValue placeholder="Selecciona un estudiante" /></SelectTrigger>
            <SelectContent>
              {availableUsers.length === 0 ? <SelectItem value="0">No hay estudiantes disponibles</SelectItem> : availableUsers.map((user) => (
                <SelectItem key={user.id} value={String(user.id)}>{user.firstName} {user.lastName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button disabled={availableUsers.length === 0 || busyAction !== null} type="submit">
          {busyAction === "enroll" ? "Inscribiendo..." : "Inscribir"}
        </Button>
      </form>

      {error ? <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}

      <EnrollmentTable enrollments={enrollments} users={users} />
    </PageShell>
  )
}
