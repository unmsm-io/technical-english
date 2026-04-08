import { Loader2, PlayCircle } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router"
import { getUser } from "../api/users"
import { PageShell } from "../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/breadcrumb"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { MetricCard } from "../components/ui/metric-card"
import { TaskApi } from "../features/task/TaskApi"
import { TaskTypeBadge } from "../features/task/components/TaskTypeBadge"
import { useTaskStore } from "../features/task/taskStore"
import { CefrBadge } from "../features/vocabulary/components/CefrBadge"
import type { User } from "../types"
import type { TaskDetail } from "../types/task"

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

  return (
    <PageShell
      actions={
        selectedUser ? (
          <Button disabled={starting} onClick={handleStartTask}>
            {starting ? <Loader2 className="size-4 animate-spin" /> : <PlayCircle className="size-4" />}
            Comenzar tarea
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link to="/users">Seleccionar usuario</Link>
          </Button>
        )
      }
      subtitle="Vista previa de contexto, nivel, vocabulario asociado y duración estimada antes de iniciar."
      title={task?.titleEs ?? "Detalle de tarea"}
    >
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Panel</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/tasks">Tareas</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{task?.titleEs ?? "Detalle"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin" />
          </CardContent>
        </Card>
      ) : error || !task ? (
        <Alert variant="destructive">
          <AlertTitle>No se pudo abrir la tarea</AlertTitle>
          <AlertDescription>{error ?? "No se encontró la tarea solicitada."}</AlertDescription>
        </Alert>
      ) : (
        <>
          <Card>
            <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <TaskTypeBadge type={task.taskType} />
                  <CefrBadge level={task.cefrLevel} />
                </div>
                <CardTitle className="text-2xl">{task.titleEs}</CardTitle>
                <CardDescription className="max-w-3xl text-sm leading-7">
                  {task.descriptionEs}
                </CardDescription>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <MetricCard label="Vocabulario relacionado" value={task.vocabularyItems.length} />
                <MetricCard
                  context="Lectura de contexto + producción"
                  label="Duración estimada"
                  value={`${estimatedDuration} min`}
                />
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vista previa del pre-task</CardTitle>
              <CardDescription>Contexto inicial que el estudiante debe leer antes de responder.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm leading-7 text-muted-foreground">
              {task.preTaskContextEn}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vocabulario asociado</CardTitle>
              <CardDescription>Términos que aparecen en el flujo o que conviene repasar antes de empezar.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {task.vocabularyItems.length > 0 ? (
                task.vocabularyItems.map((item) => (
                  <Card className="border-dashed" key={item.id}>
                    <CardContent className="space-y-1 p-4">
                      <div className="font-medium">{item.term}</div>
                      <div className="text-sm text-muted-foreground">{item.definition}</div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Alert>
                  <AlertTitle>Sin vocabulario adicional</AlertTitle>
                  <AlertDescription>Esta tarea no requiere términos enlazados para completarse.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {selectedUser ? (
            <Alert>
              <AlertTitle>Intento listo para iniciar</AlertTitle>
              <AlertDescription>
                La tarea se iniciará para {selectedUser.firstName} {selectedUser.lastName}.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="warning">
              <AlertTitle>Falta seleccionar un usuario</AlertTitle>
              <AlertDescription>
                Para registrar el intento necesitas elegir un estudiante antes de empezar.
              </AlertDescription>
            </Alert>
          )}

          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </>
      )}
    </PageShell>
  )
}
