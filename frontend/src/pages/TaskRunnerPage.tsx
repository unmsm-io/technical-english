import { Loader2 } from "lucide-react"
import { Fragment, useEffect, useMemo, useState } from "react"
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router"
import { TaskApi } from "../features/task/TaskApi"
import { CodeBlock } from "../features/task/components/CodeBlock"
import { MicroGloss } from "../features/task/components/MicroGloss"
import { PhaseStepper } from "../features/task/components/PhaseStepper"
import { useTaskStore } from "../features/task/taskStore"
import type { TaskGloss } from "../types/task"

function TaskRunnerBreadcrumb({
  taskId,
  title,
  phaseLabel,
  userId,
}: {
  taskId: number
  title: string
  phaseLabel: string
  userId: number | null
}) {
  const detailPath = userId ? `/tasks/${taskId}?userId=${userId}` : `/tasks/${taskId}`

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
          <Link to={detailPath} className="transition hover:text-gray-900">
            {title}
          </Link>
        </li>
        <li>&gt;</li>
        <li className="font-medium text-gray-900">{phaseLabel}</li>
      </ol>
    </nav>
  )
}

function escapeForRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function renderGlossedContent(content: string, glosses: TaskGloss[]) {
  if (glosses.length === 0) {
    return <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">{content}</p>
  }

  const sortedGlosses = [...glosses].sort((left, right) => right.term.length - left.term.length)
  const pattern = new RegExp(`(${sortedGlosses.map((gloss) => escapeForRegex(gloss.term)).join("|")})`, "g")
  const glossary = new Map(sortedGlosses.map((gloss) => [gloss.term, gloss.gloss]))

  return (
    <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
      {content.split(pattern).map((chunk, index) => {
        const gloss = glossary.get(chunk)

        if (!gloss) {
          return <Fragment key={`${chunk}-${index}`}>{chunk}</Fragment>
        }

        return (
          <MicroGloss key={`${chunk}-${index}`} term={chunk} gloss={gloss}>
            {chunk}
          </MicroGloss>
        )
      })}
    </p>
  )
}

export function TaskRunnerPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const currentTask = useTaskStore((state) => state.currentTask)
  const currentAttempt = useTaskStore((state) => state.currentAttempt)
  const currentPhase = useTaskStore((state) => state.currentPhase)
  const userAnswer = useTaskStore((state) => state.userAnswer)
  const isSubmitting = useTaskStore((state) => state.isSubmitting)
  const storeError = useTaskStore((state) => state.error)
  const startTask = useTaskStore((state) => state.startTask)
  const setPhase = useTaskStore((state) => state.setPhase)
  const setUserAnswer = useTaskStore((state) => state.setUserAnswer)
  const submit = useTaskStore((state) => state.submit)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const taskId = Number(id)
  const attemptId = Number(searchParams.get("attemptId") ?? "")
  const selectedUserId = Number(searchParams.get("userId") ?? "")

  useEffect(() => {
    if (!taskId || !attemptId) {
      setLoading(false)
      setError("No se encontró un intento activo para esta tarea.")
      return
    }

    const storeHasData =
      currentTask?.id === taskId && currentAttempt?.id === attemptId

    if (storeHasData) {
      setLoading(false)
      return
    }

    Promise.all([TaskApi.getById(taskId), TaskApi.getAttempt(attemptId)])
      .then(([task, attempt]) => {
        startTask(task, attempt)
      })
      .catch(() => setError("No se pudo cargar la tarea en ejecución."))
      .finally(() => setLoading(false))
  }, [attemptId, currentAttempt?.id, currentTask?.id, startTask, taskId])

  const task = currentTask?.id === taskId ? currentTask : null
  const attempt = currentAttempt?.id === attemptId ? currentAttempt : null

  useEffect(() => {
    if (!task || !attempt) {
      return
    }

    if (attempt.phase === "POST_TASK" || attempt.phase === "COMPLETED") {
      navigate(`/tasks/${task.id}/result/${attempt.id}`, {
        replace: true,
        state: { feedback: useTaskStore.getState().feedback ?? null },
      })
    }
  }, [attempt, navigate, task])

  const phaseLabel = useMemo(() => {
    switch (currentPhase) {
      case "PRE_TASK":
        return "Preparación"
      case "DURING_TASK":
        return "Tarea"
      case "POST_TASK":
        return "Resultado"
      case "COMPLETED":
        return "Completada"
      default:
        return "Tarea"
    }
  }, [currentPhase])

  if (!taskId) {
    return <Navigate to="/tasks" replace />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !task || !attempt || !currentPhase) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
        <p className="text-sm text-red-700">
          {error ?? "No se pudo recuperar la tarea en ejecución."}
        </p>
      </div>
    )
  }

  const handleAdvance = async () => {
    try {
      const updatedAttempt = await TaskApi.advancePhase(attempt.id, "DURING_TASK")
      startTask(task, updatedAttempt)
      setPhase(updatedAttempt.phase)
    } catch {
      setError("No se pudo avanzar a la fase de tarea.")
    }
  }

  const handleSubmit = async () => {
    try {
      const feedback = await submit()
      navigate(`/tasks/${task.id}/result/${attempt.id}`, {
        state: { feedback },
      })
    } catch {
      return
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <TaskRunnerBreadcrumb
        taskId={task.id}
        title={task.titleEs}
        phaseLabel={phaseLabel}
        userId={selectedUserId || null}
      />

      <div className="space-y-3">
        <PhaseStepper phase={currentPhase} />
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{task.titleEs}</h1>
          <p className="mt-1 text-sm text-gray-600">{task.descriptionEs}</p>
        </div>
      </div>

      {currentPhase === "PRE_TASK" ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Preparación</h2>
            <div className="mt-4">{renderGlossedContent(task.preTaskContextEn, task.preTaskGlosses)}</div>
            <button
              type="button"
              onClick={handleAdvance}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Listo, comenzar
            </button>
          </section>

          <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Vocabulario de apoyo</h2>
            <div className="mt-4 space-y-3">
              {task.vocabularyItems.length > 0 ? (
                task.vocabularyItems.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <p className="font-medium text-gray-900">{item.term}</p>
                    <p className="mt-1 text-sm text-gray-600">{item.definition}</p>
                  </article>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-sm text-gray-500">
                  Esta tarea no requiere vocabulario adicional enlazado.
                </p>
              )}
            </div>
          </aside>
        </div>
      ) : null}

      {currentPhase === "DURING_TASK" ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <CodeBlock code={task.duringTaskPromptEn} language="Technical input" />

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Tu respuesta</h2>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              {task.duringTaskInstructionEs}
            </p>
            <textarea
              value={userAnswer}
              onChange={(event) => setUserAnswer(event.target.value)}
              rows={8}
              className="mt-4 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
              placeholder="Write your answer in English..."
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-500">
                Responde en inglés con suficiente detalle técnico para justificar tu decisión.
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!userAnswer.trim() || isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Enviar respuesta
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {currentPhase === "POST_TASK" ? (
        <section className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />
          <p className="mt-4 text-sm text-gray-600">Generando feedback...</p>
        </section>
      ) : null}

      {error || storeError ? (
        <p className="text-sm text-red-600">{error ?? storeError}</p>
      ) : null}
    </div>
  )
}
