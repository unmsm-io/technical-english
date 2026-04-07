import { Clock3, Loader2, PlayCircle } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router"
import { getUser } from "../api/users"
import { TaskApi } from "../features/task/TaskApi"
import { TaskTypeBadge } from "../features/task/components/TaskTypeBadge"
import { useTaskStore } from "../features/task/taskStore"
import { CefrBadge } from "../features/vocabulary/components/CefrBadge"
import type { User } from "../types"
import type { TaskDetail } from "../types/task"

function TaskDetailBreadcrumb({ title }: { title: string }) {
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
        <li className="font-medium text-gray-900">{title}</li>
      </ol>
    </nav>
  )
}

export function TaskDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const startTask = useTaskStore((state) => state.startTask)

  const [task, setTask] = useState<TaskDetail | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const taskId = Number(id)
  const selectedUserId = Number(searchParams.get("userId") ?? "")

  useEffect(() => {
    if (!taskId) {
      setError("La tarea solicitada no es válida.")
      setLoading(false)
      return
    }

    const requests: Array<Promise<unknown>> = [TaskApi.getById(taskId)]
    if (selectedUserId) {
      requests.push(getUser(selectedUserId))
    }

    Promise.all(requests)
      .then((results) => {
        setTask(results[0] as TaskDetail)
        setSelectedUser((results[1] as User | undefined) ?? null)
      })
      .catch(() => setError("No se pudo cargar el detalle de la tarea."))
      .finally(() => setLoading(false))
  }, [selectedUserId, taskId])

  const estimatedDuration = useMemo(() => {
    if (!task) {
      return 0
    }

    const totalWords = `${task.preTaskContextEn} ${task.duringTaskPromptEn}`
      .trim()
      .split(/\s+/)
      .filter(Boolean).length

    return Math.max(1, Math.ceil(totalWords / 40))
  }, [task])

  const handleStartTask = async () => {
    if (!task || !selectedUserId) {
      return
    }

    setStarting(true)
    setError(null)

    try {
      const attempt = await TaskApi.startAttempt(selectedUserId, task.id)
      startTask(task, attempt)

      navigate(`/tasks/${task.id}/run?attemptId=${attempt.id}&userId=${selectedUserId}`)
    } catch {
      setError("No se pudo iniciar la tarea.")
    } finally {
      setStarting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
        <p className="text-sm text-red-700">
          {error ?? "No se encontró la tarea solicitada."}
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <TaskDetailBreadcrumb title={task.titleEs} />

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <TaskTypeBadge type={task.taskType} />
              <CefrBadge level={task.cefrLevel} />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">{task.titleEs}</h1>
            <p className="max-w-3xl text-sm leading-7 text-gray-600">
              {task.descriptionEs}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Vocabulario relacionado
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {task.vocabularyItems.length}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Duración estimada
              </p>
              <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-slate-900">
                <Clock3 className="h-5 w-5 text-slate-500" />
                {estimatedDuration} min
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Vista previa del pre-task</h2>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-700">
          {task.preTaskContextEn}
        </p>
      </section>

      {selectedUser ? (
        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-sm text-blue-900">
            La tarea se iniciará para {selectedUser.firstName} {selectedUser.lastName}.
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={handleStartTask}
              disabled={starting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {starting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlayCircle className="h-4 w-4" />
              )}
              Comenzar tarea
            </button>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm text-amber-900">
            Para registrar el intento necesitas seleccionar un usuario.
          </p>
          <Link
            to="/users"
            className="mt-4 inline-flex rounded-xl border border-amber-300 px-4 py-2 text-sm font-medium text-amber-900 transition hover:bg-amber-100"
          >
            Ir a la lista de usuarios
          </Link>
        </section>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
}
