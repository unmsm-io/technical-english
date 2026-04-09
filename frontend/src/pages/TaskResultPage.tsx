import { Loader2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router"
import { PageShell } from "../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Textarea } from "../components/ui/textarea"
import { TaskApi } from "../features/task/TaskApi"
import { FeedbackPanel } from "../features/task/components/FeedbackPanel"
import type { TaskAttempt, TaskDetail, TaskFeedback } from "../types/task"

function buildFeedback(task: TaskDetail, attempt: TaskAttempt): TaskFeedback | null {
  if (!attempt.llmFeedbackPayload || attempt.score === null || !attempt.userAnswerEn) {
    return null
  }

  return {
    attemptId: attempt.id,
    expectedAnswerEn: task.expectedAnswerEn,
    improvedAnswer: attempt.llmFeedbackPayload.improvedAnswer,
    languageFocusComments: attempt.llmFeedbackPayload.languageFocusComments,
    llmFeedbackPayload: attempt.llmFeedbackPayload,
    postTaskExplanationEs: task.postTaskExplanationEs,
    score: attempt.score,
    taskId: task.id,
    taskType: task.taskType,
    userAnswerEn: attempt.userAnswerEn,
  }
}

function buildRewriteFeedback(task: TaskDetail, attempt: TaskAttempt): TaskFeedback | null {
  if (!attempt.rewriteFeedbackPayload || attempt.rewriteScore === null || !attempt.rewriteAnswerEn) {
    return null
  }

  return {
    attemptId: attempt.id,
    expectedAnswerEn: task.expectedAnswerEn,
    improvedAnswer: attempt.rewriteFeedbackPayload.improvedAnswer,
    languageFocusComments: attempt.rewriteFeedbackPayload.languageFocusComments,
    llmFeedbackPayload: attempt.rewriteFeedbackPayload,
    postTaskExplanationEs: task.postTaskExplanationEs,
    score: attempt.rewriteScore,
    taskId: task.id,
    taskType: task.taskType,
    userAnswerEn: attempt.rewriteAnswerEn,
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
  const [rewriteAnswer, setRewriteAnswer] = useState("")
  const [rewriteSubmitting, setRewriteSubmitting] = useState(false)
  const [rewriteError, setRewriteError] = useState<string | null>(null)
  const [rewriteFeedback, setRewriteFeedback] = useState<TaskFeedback | null>(null)
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
        setRewriteAnswer(attemptData.rewriteAnswerEn ?? "")
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

  const persistedRewriteFeedback = useMemo(() => {
    if (!task || !attempt) {
      return null
    }

    return buildRewriteFeedback(task, attempt)
  }, [attempt, task])

  if (!taskId || !attemptIdValue) {
    return <Navigate replace to="/tasks" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  if (error || !task || !attempt) {
    return (
      <PageShell
        subtitle="No fue posible reconstruir el intento solicitado."
        title="Resultado"
      >
        <Alert variant="destructive">
          <AlertTitle>Error de carga</AlertTitle>
          <AlertDescription>{error ?? "No se encontró el resultado solicitado."}</AlertDescription>
        </Alert>
      </PageShell>
    )
  }

  if (attempt.phase === "PRE_TASK" || attempt.phase === "DURING_TASK") {
    return <Navigate replace to={`/tasks/${task.id}/run?attemptId=${attempt.id}&userId=${attempt.userId}`} />
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

  const handleRewriteSubmit = async () => {
    if (!attempt || !task) {
      return
    }

    setRewriteSubmitting(true)
    setRewriteError(null)

    try {
      const submittedRewrite = await TaskApi.submitRewrite(attempt.id, rewriteAnswer)
      const updatedAttempt = await TaskApi.getAttempt(attempt.id)
      setRewriteFeedback(submittedRewrite)
      setAttempt(updatedAttempt)
      setRewriteAnswer(updatedAttempt.rewriteAnswerEn ?? rewriteAnswer)
    } catch {
      setRewriteError("No se pudo enviar la reescritura. Intenta nuevamente.")
    } finally {
      setRewriteSubmitting(false)
    }
  }

  const canRewrite =
    attempt.userAnswerEn !== null &&
    attempt.score !== null &&
    attempt.rewriteAnswerEn === null &&
    !rewriteSubmitting

  return (
    <PageShell
      actions={<Badge variant="secondary">{feedback?.score ?? attempt.score ?? 0}/100</Badge>}
      subtitle={task.titleEs}
      title="Resultado"
    >
      {feedback ? (
        <FeedbackPanel feedback={feedback} />
      ) : (
        <Alert>
          <AlertTitle>Feedback parcial</AlertTitle>
          <AlertDescription>
            El intento está guardado, pero no se pudo reconstruir el feedback detallado.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Explicación</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
            {task.postTaskExplanationEs}
          </p>
        </CardContent>
      </Card>

      {attempt.rewriteAnswerEn === null ? (
        <Card>
          <CardHeader>
            <CardTitle>Reescribir</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">
              Envía una nueva versión en inglés para medir si mejoraste respecto a tu primera respuesta.
            </p>
            <Textarea
              onChange={(event) => setRewriteAnswer(event.target.value)}
              placeholder="Escribe aquí tu nueva versión en inglés."
              rows={8}
              value={rewriteAnswer}
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                disabled={!canRewrite || rewriteAnswer.trim().length === 0}
                onClick={handleRewriteSubmit}
              >
                {rewriteSubmitting ? "Enviando..." : "Enviar reescritura"}
              </Button>
              <p className="text-sm text-muted-foreground">Solo puedes enviar una reescritura por intento.</p>
            </div>
            {rewriteError ? (
              <Alert variant="destructive">
                <AlertTitle>Error de reescritura</AlertTitle>
                <AlertDescription>{rewriteError}</AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {rewriteFeedback || persistedRewriteFeedback ? (
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Resultado de la reescritura</CardTitle>
            </div>
            <Badge variant={attempt.rewriteAccepted ? "secondary" : "outline"}>
              {attempt.rewriteAccepted ? "Mejora aceptada" : "Sin mejora"}
            </Badge>
          </CardHeader>
          <CardContent>
            <FeedbackPanel feedback={rewriteFeedback ?? persistedRewriteFeedback!} />
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button disabled={completing} onClick={handleComplete}>
          {completing ? "Marcando..." : "Marcar completada"}
        </Button>
        <Button asChild variant="outline">
          <Link to={`/tasks?type=${task.taskType}`}>Otra tarea similar</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/tasks">Volver al listado</Link>
        </Button>
      </div>
    </PageShell>
  )
}
