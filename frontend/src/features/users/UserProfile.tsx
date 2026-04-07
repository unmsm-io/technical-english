import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams, Link } from "react-router"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Loader2,
  Mail,
  GraduationCap,
  Building,
  Calendar,
  ClipboardCheck,
} from "lucide-react"
import { deleteUser, getUser, patchUserProfile } from "../../api/users"
import { getDiagnosticHistory } from "../diagnostic/DiagnosticApi"
import { ReviewApi } from "../review/ReviewApi"
import { TaskApi } from "../task/TaskApi"
import { TaskTypeBadge } from "../task/components/TaskTypeBadge"
import type { DiagnosticAttemptHistory } from "../../types/diagnostic"
import type { ReviewStats } from "../../types/review"
import type { TaskAttemptHistoryItem } from "../../types/task"
import type { User } from "../../types"

const targetSkillOptions = [
  { value: "READING_DOCS", label: "Lectura de documentación" },
  { value: "ERROR_MESSAGES", label: "Interpretar error messages" },
  { value: "API_NAVIGATION", label: "Navegación de APIs" },
  { value: "WRITING_REPORTS", label: "Redacción técnica" },
  { value: "TEAM_COMMUNICATION", label: "Comunicación en equipo" },
  { value: "TECH_PRESENTATIONS", label: "Presentaciones técnicas" },
]

export function UserProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [history, setHistory] = useState<DiagnosticAttemptHistory[]>([])
  const [taskHistory, setTaskHistory] = useState<TaskAttemptHistoryItem[]>([])
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    const userId = Number(id)
    Promise.all([getUser(userId), getDiagnosticHistory(userId), TaskApi.getHistory(userId)])
      .then(([userData, historyData, taskHistoryData]) => {
        setUser(userData)
        setHistory(historyData)
        setTaskHistory(taskHistoryData)
        setSelectedSkills(userData.targetSkills)
        if (userData.englishLevel) {
          ReviewApi.getStats(userId).then(setReviewStats).catch(() => setReviewStats(null))
        }
      })
      .catch(() => setError("No se pudo cargar el perfil del usuario."))
      .finally(() => setLoading(false))
  }, [id])

  const roleBadge = useMemo(
    () => (role: string) => {
      const colors: Record<string, string> = {
        STUDENT: "bg-green-100 text-green-700",
        TEACHER: "bg-blue-100 text-blue-700",
        ADMIN: "bg-purple-100 text-purple-700",
      }

      return (
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${colors[role]}`}
        >
          {role}
        </span>
      )
    },
    []
  )

  const handleDelete = async () => {
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return
    try {
      await deleteUser(Number(id))
      navigate("/users")
    } catch {
      setError("No se pudo eliminar el usuario.")
    }
  }

  const handleToggleSkill = (value: string) => {
    setSelectedSkills((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    )
  }

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)
    setSaveMessage(null)
    setError(null)

    try {
      const updatedUser = await patchUserProfile(user.id, {
        targetSkills: selectedSkills,
        vocabularySize: user.vocabularySize ?? undefined,
        diagnosticCompleted: user.diagnosticCompleted,
        diagnosticCompletedAt: user.diagnosticCompletedAt ?? undefined,
      })
      setUser(updatedUser)
      setSaveMessage("Perfil actualizado correctamente.")
    } catch {
      setError("No se pudo actualizar el perfil.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">{error || "User not found"}</p>
        <Link to="/users" className="mt-2 text-sm text-blue-600 hover:underline">
          Volver a usuarios
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button
        onClick={() => navigate("/users")}
        className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a usuarios
      </button>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-semibold text-blue-700">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <p className="font-mono text-sm text-gray-500">{user.codigo}</p>
              <div className="mt-1">{roleBadge(user.role)}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate(`/users/${user.id}/edit`)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          </div>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <InfoBlock icon={<Mail className="mt-0.5 h-5 w-5 text-gray-400" />} label="Email" value={user.email} />
          <InfoBlock
            icon={<GraduationCap className="mt-0.5 h-5 w-5 text-gray-400" />}
            label="Nivel CEFR"
            value={user.englishLevel || "No asignado"}
          />
          <InfoBlock
            icon={<Building className="mt-0.5 h-5 w-5 text-gray-400" />}
            label="Facultad"
            value={user.faculty || "No registrada"}
          />
          <InfoBlock
            icon={<Calendar className="mt-0.5 h-5 w-5 text-gray-400" />}
            label="Registrado"
            value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
          />
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Nivel e intereses</h2>
            <p className="mt-1 text-sm text-gray-600">
              Ajusta los objetivos del estudiante y lanza el diagnostico desde
              este perfil.
            </p>
          </div>
          <Link
            to={`/diagnostic/start?userId=${user.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <ClipboardCheck className="h-4 w-4" />
            Tomar diagnóstico
          </Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <MetricCard label="Diagnóstico" value={user.diagnosticCompleted ? "Completado" : "Pendiente"} />
          <MetricCard label="Tamaño vocabular" value={user.vocabularySize ? `${user.vocabularySize}` : "Sin estimar"} />
          <MetricCard
            label="Último diagnóstico"
            value={
              user.diagnosticCompletedAt
                ? new Date(user.diagnosticCompletedAt).toLocaleDateString()
                : "Sin fecha"
            }
          />
        </div>

        <div className="mt-6">
          <p className="mb-3 text-sm font-medium text-gray-700">Target skills</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {targetSkillOptions.map((option) => {
              const checked = selectedSkills.includes(option.value)
              return (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm transition ${
                    checked
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-gray-200 bg-white text-gray-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleSkill(option.value)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span>{option.label}</span>
                </label>
              )
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={saving}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar intereses"}
          </button>
          {saveMessage ? <p className="text-sm text-emerald-600">{saveMessage}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Mi deck de vocabulario</h2>
            <p className="mt-1 text-sm text-gray-600">
              Resumen del estado actual del repaso espaciado para este estudiante.
            </p>
          </div>
          {user.englishLevel ? (
            <Link
              to={`/review/deck?userId=${user.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Ver deck completo
            </Link>
          ) : null}
        </div>

        {reviewStats ? (
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <MetricCard label="Cards totales" value={`${reviewStats.totalCards}`} />
            <MetricCard label="Para hoy" value={`${reviewStats.dueToday}`} />
            <MetricCard label="Retention" value={`${reviewStats.retentionRate}%`} />
            <MetricCard label="Longest streak" value={`${reviewStats.longestStreak} días`} />
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-gray-200 px-4 py-8 text-sm text-gray-500">
            {user.englishLevel
              ? "No se pudo cargar el deck de vocabulario."
              : "Toma el diagnóstico primero para generar el deck de vocabulario."}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Historial de tareas TBLT</h2>
            <p className="mt-1 text-sm text-gray-600">
              Revisa tareas completadas o pendientes con su puntaje más reciente.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {taskHistory.length > 0 ? (
            taskHistory.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(`/tasks/${item.taskId}/result/${item.id}`)}
                className="flex w-full flex-col gap-3 rounded-xl border border-gray-200 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{item.taskTitleEs}</p>
                  <TaskTypeBadge type={item.taskType} />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span>Puntaje: {item.score ?? "Pendiente"}</span>
                  <span>
                    {item.completedAt
                      ? new Date(item.completedAt).toLocaleDateString()
                      : "En progreso"}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-sm text-gray-500">
              Aún no hay tareas TBLT registradas para este usuario.
            </div>
          )}
        </div>
      </section>

      <details className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm" open>
        <summary className="cursor-pointer list-none text-lg font-semibold text-gray-900">
          Historial de diagnósticos
        </summary>
        <div className="mt-5 space-y-3">
          {history.length === 0 ? (
            <p className="text-sm text-gray-500">
              Este usuario todavía no ha completado diagnósticos.
            </p>
          ) : (
            history.map((attempt) => (
              <div
                key={attempt.attemptId}
                className="rounded-xl border border-gray-200 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Placement: {attempt.placedLevel ?? "Pendiente"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Correctas: {attempt.correctCount}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {attempt.completedAt
                      ? new Date(attempt.completedAt).toLocaleString()
                      : "Sin completar"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </details>
    </div>
  )
}

function InfoBlock({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      {icon}
      <div>
        <p className="text-xs font-medium uppercase text-gray-500">{label}</p>
        <p className="text-sm text-gray-900">{value}</p>
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  )
}
