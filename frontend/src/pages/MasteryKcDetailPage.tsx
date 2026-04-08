import { FileText, Loader2, Radar } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router"
import { getUsers } from "../api/users"
import { PageShell } from "../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { EmptyState } from "../components/ui/empty-state"
import { MetricCard } from "../components/ui/metric-card"
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
      .catch(() => setError("No se pudo cargar el detalle del knowledge component."))
      .finally(() => setLoading(false))
  }, [kcId, userId])

  const user = useMemo(
    () => users.find((candidate) => candidate.id === userId) ?? null,
    [userId, users]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  if (error || !detail) {
    return (
      <PageShell
        subtitle="No fue posible recuperar el componente solicitado."
        title="Detalle"
      >
        <Alert variant="destructive">
          <AlertTitle>Error de carga</AlertTitle>
          <AlertDescription>{error ?? "No se encontró el detalle solicitado."}</AlertDescription>
        </Alert>
      </PageShell>
    )
  }

  return (
    <PageShell
      actions={
        <Button asChild variant="outline">
          <Link to={userId ? `/mastery?userId=${userId}` : "/mastery"}>Volver a Mi dominio</Link>
        </Button>
      }
      subtitle={detail.knowledgeComponent.description}
      title={detail.knowledgeComponent.nameEs}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{detail.knowledgeComponent.category}</Badge>
              <Badge variant="outline">{detail.knowledgeComponent.cefrLevel}</Badge>
            </div>
            <div className="space-y-2">
              <CardTitle>{detail.knowledgeComponent.name}</CardTitle>
              {user ? (
                <p className="text-sm text-muted-foreground">
                  Seguimiento de {user.firstName} {user.lastName}.
                </p>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="P(L) actual" value={`${Math.round(detail.state.pLearned * 100)}%`} />
            <MetricCard label="Respuestas" value={detail.state.totalResponses} />
            <MetricCard label="Correctas" value={detail.state.correctResponses} />
            <MetricCard
              label="Última respuesta"
              value={detail.state.lastResponseAt ? new Date(detail.state.lastResponseAt).toLocaleDateString() : "Sin actividad"}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items relacionados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {detail.relatedItems.length === 0 ? (
              <EmptyState
                description="Todavía no hay mappings asociados a este knowledge component."
                icon={FileText}
                title="Sin items relacionados"
              />
            ) : (
              detail.relatedItems.map((item) => (
                <div className="rounded-lg border border-border bg-muted/20 px-4 py-3" key={`${item.itemType}-${item.itemId}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{item.itemType}</span>
                    <span className="text-sm text-muted-foreground">ID {item.itemId}</span>
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                    Peso {item.weight.toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial reciente</CardTitle>
          <AlertDescription>
            Últimos {detail.history.length} registros del knowledge component.
          </AlertDescription>
        </CardHeader>
        <CardContent>
          {detail.history.length === 0 ? (
            <EmptyState
              description="Aún no hay logs para este knowledge component."
              icon={Radar}
              title="Sin historial"
            />
          ) : (
            <div className="relative space-y-4 pl-4">
              <div className="absolute bottom-0 left-1.5 top-1.5 w-px bg-border" />
              {detail.history.map((entry) => (
                <div className="relative rounded-lg border border-border bg-card p-4" key={entry.logId}>
                  <span className="absolute -left-[1.15rem] top-5 size-3 rounded-full border border-background bg-foreground" />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{entry.itemType}</Badge>
                        <span className="text-sm text-muted-foreground">Item {entry.itemId}</span>
                        <Badge variant={entry.correct ? "secondary" : "outline"}>
                          {entry.correct ? "Correcto" : "Incorrecto"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{new Date(entry.respondedAt).toLocaleString()}</p>
                    </div>
                    <div className="grid gap-1 text-sm sm:text-right">
                      <span className="text-muted-foreground">P(L) antes: {Math.round(entry.pLearnedBefore * 100)}%</span>
                      <span className="font-semibold">P(L) después: {Math.round(entry.pLearnedAfter * 100)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageShell>
  )
}
