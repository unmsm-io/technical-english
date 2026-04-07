import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { getUsers } from "../api/users"
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
    return <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500 shadow-sm">Cargando detalle...</div>
  }

  if (error || !item) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700 shadow-sm">{error ?? "Item no encontrado."}</div>
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Item #{item.id}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {item.targetCefrLevel} · {item.targetSkill} · {item.bloomLevel}
            </p>
          </div>
          <VerificationScoreBadge score={item.overallScore} />
        </div>
        <p className="text-base leading-7 text-gray-800">{item.questionText ?? "Sin pregunta."}</p>
        <div className="grid gap-3">
          {item.options.map((option, index) => (
            <div
              key={`${item.id}-${index}`}
              className={`rounded-xl border px-4 py-3 text-sm ${
                index === item.correctAnswerIdx
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-gray-200 bg-gray-50 text-gray-700"
              }`}
            >
              <span className="font-semibold">{String.fromCharCode(65 + index)}.</span>{" "}
              {option}
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Explicación</p>
          <p className="mt-2 leading-6">{item.explanation ?? "Sin explicación."}</p>
        </div>
        {item.protectedTokens.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {item.protectedTokens.map((token) => (
              <span
                key={token}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600"
              >
                {token}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AgentScoreCard
          title="Solvability"
          score={item.solvabilityScore}
          notes={item.solvabilityNotes}
          passed={(item.solvabilityScore ?? 0) >= 0.5}
        />
        <AgentScoreCard
          title="Factual"
          score={item.factualScore}
          notes={item.factualNotes}
          passed={(item.factualScore ?? 0) >= 0.7}
        />
        <AgentScoreCard
          title="Reasoning"
          score={item.reasoningScore}
          notes={item.reasoningNotes}
          passed={(item.reasoningScore ?? 0) >= 0.5}
        />
        <AgentScoreCard
          title="Token Preservation"
          score={item.tokenPreservationOk ? 1 : 0}
          notes={item.tokenPreservationNotes}
          passed={Boolean(item.tokenPreservationOk)}
        />
      </div>

      {item.state === "PENDING_REVIEW" ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Revisión administrativa</h2>
          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <button
              type="button"
              onClick={approve}
              disabled={actionLoading}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              Aprobar
            </button>
            <div className="flex-1">
              <textarea
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                placeholder="Razón de rechazo"
                className="min-h-24 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={reject}
              disabled={actionLoading}
              className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
            >
              Rechazar
            </button>
          </div>
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
        </div>
      ) : null}

      {item.state === "APPROVED" && item.promotedToDiagnosticItemId ? (
        <Link
          to="/admin/generated-items"
          className="inline-flex rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          DiagnosticItem promovido #{item.promotedToDiagnosticItemId}
        </Link>
      ) : null}

      {item.state === "REJECTED" && item.rejectionReason ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 shadow-sm">
          Motivo de rechazo: {item.rejectionReason}
        </div>
      ) : null}
    </div>
  )
}
