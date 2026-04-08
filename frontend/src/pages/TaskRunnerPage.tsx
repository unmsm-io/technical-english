import { BookOpenText, Loader2 } from "lucide-react"
import { Fragment, useEffect, useMemo, useState } from "react"
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router"
import { PageShell } from "../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/breadcrumb"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { EmptyState } from "../components/ui/empty-state"
import { Textarea } from "../components/ui/textarea"
import { TaskApi } from "../features/task/TaskApi"
import { CodeBlock } from "../features/task/components/CodeBlock"
import { MicroGloss } from "../features/task/components/MicroGloss"
import { PhaseStepper } from "../features/task/components/PhaseStepper"
import { useTaskStore } from "../features/task/taskStore"
import type { TaskGloss } from "../types/task"

function escapeForRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function renderGlossedContent(content: string, glosses: TaskGloss[]) {
  if (glosses.length === 0) {
    return <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{content}</p>
  }

  const sortedGlosses = [...glosses].sort((left, right) => right.term.length - left.term.length)
  const pattern = new RegExp(`(${sortedGlosses.map((gloss) => escapeForRegex(gloss.term)).join("|")})`, "g")
  const glossary = new Map(sortedGlosses.map((gloss) => [gloss.term, gloss.gloss]))

  return (
    <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
      {content.split(pattern).map((chunk, index) => {
        const gloss = glossary.get(chunk)

        if (!gloss) {
          return <Fragment key={`${chunk}-${index}`}>{chunk}</Fragment>
        }

        return (
          <MicroGloss gloss={gloss} key={`${chunk}-${index}`} term={chunk}>
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

    const storeHasData = currentTask?.id === taskId && currentAttempt?.id === attemptId

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

  const handleAdvance = async () => {
    if (!attempt || !task) {
      return
    }

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
      navigate(`/tasks/${taskId}/result/${attemptId}`, {
        state: { feedback },
      })
    } catch {
      return
    }
  }

  return (
    <PageShell
      subtitle="Lee el contexto, responde en inglés y avanza por las fases del flujo TBLT."
      title={task?.titleEs ?? "Ejecución de tarea"}
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
            <BreadcrumbLink asChild>
              <Link to={selectedUserId ? `/tasks/${taskId}?userId=${selectedUserId}` : `/tasks/${taskId}`}>
                {task?.titleEs ?? "Detalle"}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{phaseLabel}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin" />
          </CardContent>
        </Card>
      ) : error || !task || !attempt || !currentPhase ? (
        <Alert variant="destructive">
          <AlertTitle>No se pudo recuperar la tarea</AlertTitle>
          <AlertDescription>{error ?? "No se pudo recuperar la tarea en ejecución."}</AlertDescription>
        </Alert>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Estado de la tarea</CardTitle>
              <CardDescription>{task.descriptionEs}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PhaseStepper phase={currentPhase} />
            </CardContent>
          </Card>

          {currentPhase === "PRE_TASK" ? (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <Card>
                <CardHeader>
                  <CardTitle>Preparación</CardTitle>
                  <CardDescription>Lee el contexto y aclara términos antes de entrar a la producción.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {renderGlossedContent(task.preTaskContextEn, task.preTaskGlosses)}
                  <Button onClick={handleAdvance}>Listo, comenzar</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vocabulario de apoyo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
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
                    <EmptyState
                      description="Esta tarea no requiere vocabulario adicional enlazado."
                      icon={BookOpenText}
                      title="Sin apoyo adicional"
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}

          {currentPhase === "DURING_TASK" ? (
            <div className="grid gap-6 xl:grid-cols-2">
              <CodeBlock code={task.duringTaskPromptEn} language="Technical input" />

              <Card>
                <CardHeader>
                  <CardTitle>Tu respuesta</CardTitle>
                  <CardDescription>{task.duringTaskInstructionEs}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    onChange={(event) => setUserAnswer(event.target.value)}
                    placeholder="Write your answer in English..."
                    rows={10}
                    value={userAnswer}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                      Responde en inglés con suficiente detalle técnico para justificar tu decisión.
                    </p>
                    <Button disabled={!userAnswer.trim() || isSubmitting} onClick={handleSubmit}>
                      {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                      Enviar respuesta
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {currentPhase === "POST_TASK" ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
                <Loader2 className="size-6 animate-spin" />
                <p className="text-sm text-muted-foreground">Generando feedback...</p>
              </CardContent>
            </Card>
          ) : null}

          {error || storeError ? (
            <Alert variant="destructive">
              <AlertTitle>Error de ejecución</AlertTitle>
              <AlertDescription>{error ?? storeError}</AlertDescription>
            </Alert>
          ) : null}
        </>
      )}
    </PageShell>
  )
}
