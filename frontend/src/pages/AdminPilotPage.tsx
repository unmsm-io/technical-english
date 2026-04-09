import { Loader2 } from "lucide-react"
import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Link } from "react-router"
import { getUsers } from "../api/users"
import { PageShell } from "../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { PilotApi } from "../features/pilot/PilotApi"
import { CohortMetricCard } from "../features/pilot/components/CohortMetricCard"
import { CohortStateBadge } from "../features/pilot/components/CohortStateBadge"
import type { User } from "../types"
import type { CreateCohortRequest, PilotCohort } from "../types/pilot"

const initialForm = { name: "", description: "", targetUserCount: 12, createdBy: 0 }

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
          setForm((current) => ({ ...current, createdBy: current.createdBy || adminUsers[0].id }))
        }
      })
      .catch(() => setError("No se pudieron cargar las cohortes del piloto."))
      .finally(() => setLoading(false))
  }, [])

  const activeCount = useMemo(() => cohorts.filter((cohort) => cohort.state !== "ARCHIVED").length, [cohorts])
  const resultsCount = useMemo(() => cohorts.filter((cohort) => cohort.state === "RESULTS_AVAILABLE").length, [cohorts])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const created = await PilotApi.createCohort(form)
      setCohorts((current) => [created, ...current])
      setForm((current) => ({ ...current, description: "", name: "", targetUserCount: current.targetUserCount }))
    } catch {
      setError("No se pudo crear la cohorte piloto.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell subtitle="Gestión local de cohortes, enrolamiento y medición pre/post." title="Pilot studies">
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="size-6 animate-spin" /></div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <CohortMetricCard label="Cohortes activas" value={`${activeCount}`} />
            <CohortMetricCard label="Con resultados" value={`${resultsCount}`} />
            <CohortMetricCard label="Capacidad objetivo" value={`${cohorts.reduce((total, cohort) => total + cohort.targetUserCount, 0)}`} />
          </div>

          <Card>
            <CardHeader><CardTitle>Crear cohorte</CardTitle></CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                <Input onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Piloto Abril 2026" required value={form.name} />
                <Input min={1} onChange={(event) => setForm((current) => ({ ...current, targetUserCount: Number(event.target.value) }))} required type="number" value={form.targetUserCount} />
                <Textarea className="md:col-span-2" onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Seguimiento local de escritura técnica con pre-test, intervención y post-test." required value={form.description} />
                <div className="md:col-span-2 flex justify-end">
                  <Button disabled={submitting || users.length === 0} type="submit">{submitting ? "Creando..." : "Crear cohorte"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {error ? <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}

          <div className="grid gap-4 lg:grid-cols-2">
            {cohorts.map((cohort) => (
              <Card key={cohort.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{cohort.name}</CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">{cohort.description}</p>
                  </div>
                  <CohortStateBadge state={cohort.state} />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border bg-muted/20 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Inscritos</p>
                      <p className="mt-1 text-2xl font-semibold">{cohort.enrolledUserCount}/{cohort.targetUserCount}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Inicio</p>
                      <p className="mt-1 text-sm font-medium">{cohort.enrollmentStartedAt ? new Date(cohort.enrollmentStartedAt).toLocaleDateString() : "Pendiente"}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild size="sm" variant="outline"><Link to={`/admin/pilot/cohorts/${cohort.id}`}>Ver cohorte</Link></Button>
                    <Button asChild size="sm"><Link to={`/admin/pilot/cohorts/${cohort.id}/results`}>Ver resultados</Link></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </PageShell>
  )
}
