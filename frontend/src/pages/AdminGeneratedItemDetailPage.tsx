import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { getUsers } from "../api/users"
import { PageShell } from "../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Textarea } from "../components/ui/textarea"
import { AdminApi } from "../features/admin/AdminApi"
import { AgentScoreCard } from "../features/admin/components/AgentScoreCard"
import { VerificationScoreBadge } from "../features/admin/components/VerificationScoreBadge"
import type { User } from "../types"
import type { GeneratedItemDetail } from "../types/admin"

export function AdminGeneratedItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState<GeneratedItemDetail | null>(null)
  const [adminUser, setAdminUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  useEffect(() => {
    const itemId = Number(id)
    Promise.all([AdminApi.getGeneratedItem(itemId), getUsers(0, 100)])
      .then(([detail, users]) => {
        setItem(detail)
        setAdminUser(users.content.find((user) => user.role === "ADMIN") ?? null)
      })
      .catch(() => setError("No se pudo cargar el detalle del item."))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <PageShell subtitle="Cargando detalle del item." title="Detalle"><div className="text-sm text-muted-foreground">Cargando...</div></PageShell>
  }

  if (error || !item) {
    return (
      <PageShell subtitle="No fue posible recuperar el item." title="Detalle">
        <Alert variant="destructive">
          <AlertTitle>Error de carga</AlertTitle>
          <AlertDescription>{error ?? "Item no encontrado."}</AlertDescription>
        </Alert>
      </PageShell>
    )
  }

  const approve = async () => {
    if (!adminUser) {
      setError("No hay usuario ADMIN disponible para aprobar.")
      return
    }
    setActionLoading(true)
    try {
      await AdminApi.approve(item.id, adminUser.id)
      navigate("/admin/generated-items")
    } catch {
      setError("No se pudo aprobar el item.")
    } finally {
      setActionLoading(false)
    }
  }

  const reject = async () => {
    if (rejectReason.trim().length === 0) {
      setError("Ingresa una razón de rechazo.")
      return
    }
    setActionLoading(true)
    try {
      await AdminApi.reject(item.id, rejectReason.trim())
      navigate("/admin/generated-items")
    } catch {
      setError("No se pudo rechazar el item.")
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <PageShell
      actions={<VerificationScoreBadge score={item.overallScore} />}
      subtitle={`${item.targetCefrLevel} · ${item.targetSkill} · ${item.bloomLevel}`}
      title={`Item #${item.id}`}
    >
      <Card>
        <CardHeader>
          <CardTitle>Pregunta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base leading-7">{item.questionText ?? "Sin pregunta."}</p>
          <div className="grid gap-3">
            {item.options.map((option, index) => (
              <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm" key={`${item.id}-${index}`}>
                <span className="font-semibold">{String.fromCharCode(65 + index)}.</span> {option}
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm">
            <p className="font-semibold">Explicación</p>
            <p className="mt-2 leading-6 text-muted-foreground">{item.explanation ?? "Sin explicación."}</p>
          </div>
          {item.protectedTokens.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {item.protectedTokens.map((token) => (
                <Badge key={token} variant="outline">{token}</Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <AgentScoreCard notes={item.solvabilityNotes} passed={(item.solvabilityScore ?? 0) >= 0.5} score={item.solvabilityScore} title="Solvability" />
        <AgentScoreCard notes={item.factualNotes} passed={(item.factualScore ?? 0) >= 0.7} score={item.factualScore} title="Factual" />
        <AgentScoreCard notes={item.reasoningNotes} passed={(item.reasoningScore ?? 0) >= 0.5} score={item.reasoningScore} title="Reasoning" />
        <AgentScoreCard notes={item.tokenPreservationNotes} passed={Boolean(item.tokenPreservationOk)} score={item.tokenPreservationOk ? 1 : 0} title="Token Preservation" />
      </div>

      {item.state === "PENDING_REVIEW" ? (
        <Card>
          <CardHeader>
            <CardTitle>Revisión administrativa</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-3">
              <Button disabled={actionLoading} onClick={approve}>Aprobar</Button>
              <Button disabled={actionLoading} onClick={reject} variant="outline">Rechazar</Button>
            </div>
            <Textarea
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Razón de rechazo"
              value={rejectReason}
            />
          </CardContent>
        </Card>
      ) : null}

      {item.state === "APPROVED" && item.promotedToDiagnosticItemId ? (
        <Button asChild variant="outline">
          <Link to="/admin/generated-items">DiagnosticItem promovido #{item.promotedToDiagnosticItemId}</Link>
        </Button>
      ) : null}

      {item.state === "REJECTED" && item.rejectionReason ? (
        <Alert variant="destructive">
          <AlertTitle>Motivo de rechazo</AlertTitle>
          <AlertDescription>{item.rejectionReason}</AlertDescription>
        </Alert>
      ) : null}
    </PageShell>
  )
}
