import { Loader2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router"
import { TaskApi } from "../features/task/TaskApi"
import { FeedbackPanel } from "../features/task/components/FeedbackPanel"
import type { TaskAttempt, TaskDetail, TaskFeedback } from "../types/task"

function TaskResultBreadcrumb({ taskId, title }: { taskId: number; title: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <li>
          <Link to="/" className="transition hover:text-gray-900">
            Home
          </Link>
        </li>
        <li>&gt;</li>
        <li>
          <Link to="/tasks" className="transition hover:text-gray-900">
            Tareas
          </Link>
        </li>
        <li>&gt;</li>
        <li>
          <Link to={`/tasks/${taskId}`} className="transition hover:text-gray-900">
            {title}
          </Link>
        </li>
        <li>&gt;</li>
        <li className="font-medium text-gray-900">Resultado</li>
      </ol>
    </nav>
  )
}

function getScoreBadgeClasses(score: number) {
  if (score >= 80) {
    return "bg-emerald-100 text-emerald-800"
  }

  if (score >= 50) {
    return "bg-amber-100 text-amber-800"
  }

  return "bg-red-100 text-red-800"
}

function buildFeedback(task: TaskDetail, attempt: TaskAttempt): TaskFeedback | null {
  if (!attempt.llmFeedbackPayload || attempt.score === null || !attempt.userAnswerEn) {
    return null
  }

  return {
    attemptId: attempt.id,
    taskId: task.id,
    taskType: task.taskType,
    score: attempt.score,
    userAnswerEn: attempt.userAnswerEn,
    expectedAnswerEn: task.expectedAnswerEn,
    postTaskExplanationEs: task.postTaskExplanationEs,
    llmFeedbackPayload: attempt.llmFeedbackPayload,
    languageFocusComments: attempt.llmFeedbackPayload.languageFocusComments,
    improvedAnswer: attempt.llmFeedbackPayload.improvedAnswer,
  }
}

export function TaskResultPage() {
  const { id, attemptId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [task, setTask] = useState<TaskDetail | null>(null)
  const [attempt, setAttempt] = useState<TaskAttempt | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const taskId = Number(id)
  const attemptIdValue = Number(attemptId)
  const stateFeedback = (location.state as { feedback?: TaskFeedback } | null)?.feedback

  useEffect(() => {
    if (!taskId || !attemptIdValue) {
      setError("No se pudo identificar el resultado solicitado.")
      setLoading(false)
      return
    }

    Promise.all([TaskApi.getById(taskId), TaskApi.getAttempt(attemptIdValue)])
      .then(([taskData, attemptData]) => {
        setTask(taskData)
        setAttempt(attemptData)
      })
      .catch(() => setError("No se pudo cargar el resultado de la tarea."))
      .finally(() => setLoading(false))
  }, [attemptIdValue, taskId])

  const feedback = useMemo(() => {
    if (stateFeedback) {
      return stateFeedback
    }

    if (!task || !attempt) {
      return null
    }

    return buildFeedback(task, attempt)
  }, [attempt, stateFeedback, task])

  if (!taskId || !attemptIdValue) {
    return <Navigate to="/tasks" replace />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !task || !attempt) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
        <p className="text-sm text-red-700">
          {error ?? "No se encontró el resultado solicitado."}
        </p>
      </div>
    )
  }

  if (attempt.phase === "PRE_TASK" || attempt.phase === "DURING_TASK") {
    return (
      <Navigate
        to={`/tasks/${task.id}/run?attemptId=${attempt.id}&userId=${attempt.userId}`}
        replace
      />
    )
  }

  const handleComplete = async () => {
    if (attempt.phase === "COMPLETED") {
      navigate("/tasks")
      return
    }

    setCompleting(true)

    try {
      const completedAttempt = await TaskApi.complete(attempt.id)
      setAttempt(completedAttempt)
      navigate("/tasks")
    } catch {
      setError("No se pudo marcar la tarea como completada.")
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <TaskResultBreadcrumb taskId={task.id} title={task.titleEs} />

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Resultado TBLT</p>
            <h1 className="mt-1 text-2xl font-semibold text-gray-900">
              {task.titleEs}
            </h1>
          </div>
          <span
            className={`inline-flex w-fit rounded-full px-5 py-2 text-lg font-semibold ${getScoreBadgeClasses(
              feedback?.score ?? attempt.score ?? 0
            )}`}
          >
            {(feedback?.score ?? attempt.score ?? 0)}/100
          </span>
        </div>
      </section>

      {feedback ? (
        <FeedbackPanel feedback={feedback} />
      ) : (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <p className="text-sm text-amber-900">
            El intento está guardado, pero no se pudo reconstruir el feedback detallado.
          </p>
        </section>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Explicación</h2>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-700">
          {task.postTaskExplanationEs}
        </p>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleComplete}
          disabled={completing}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {completing ? "Marcando..." : "Marcar completada"}
        </button>
        <Link
          to={`/tasks?type=${task.taskType}`}
          className="rounded-xl border border-gray-300 px-5 py-3 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Otra tarea similar
        </Link>
        <Link
          to="/tasks"
          className="rounded-xl border border-gray-300 px-5 py-3 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Volver al listado
        </Link>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
}
