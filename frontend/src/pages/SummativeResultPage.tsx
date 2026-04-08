import { FileText, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, Navigate, useParams } from "react-router"
import { PageShell } from "../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { EmptyState } from "../components/ui/empty-state"
import { SummativeApi } from "../features/summative/SummativeApi"
import { McqQuestion } from "../features/summative/components/McqQuestion"
import { SummativeResultCard } from "../features/summative/components/SummativeResultCard"
import type { SummativeResult, SummativeTestDetail } from "../types/summative"

export function SummativeResultPage() {
  const { id, attemptId } = useParams()
  const [result, setResult] = useState<SummativeResult | null>(null)
  const [test, setTest] = useState<SummativeTestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const testId = Number(id)
  const attemptIdValue = Number(attemptId)

  useEffect(() => {
    if (!testId || !attemptIdValue) {
      setError("No se pudo identificar el resultado solicitado.")
      setLoading(false)
      return
    }

    Promise.all([
      SummativeApi.getAttempt(attemptIdValue),
      SummativeApi.getById(testId),
    ])
      .then(([attempt, detail]) => {
        if (attempt.currentPhase !== "COMPLETED") {
          throw new Error("Attempt not completed")
        }
        setTest(detail)
        setResult({
          attemptId: attempt.id,
          completedAt: attempt.completedAt ?? attempt.startedAt,
          comprehensionReview: detail.comprehensionQuestions.map((question, index) => {
            const response = attempt.comprehensionResponses.find((item) => item.questionIdx === index)
            return {
              ...question,
              selectedAnswerIdx: response?.answerIdx ?? null,
              correct: response?.correct ?? false,
            }
          }),
          comprehensionScore: attempt.comprehensionScore ?? 0,
          overallScore: attempt.overallScore ?? 0,
          passed: attempt.passed ?? false,
          productionAnswerEn: attempt.productionAnswerEn ?? "",
          productionFeedbackPayload: attempt.productionFeedbackPayload,
          productionScore: attempt.productionScore ?? 0,
          taskType: detail.taskType,
          testId: detail.id,
          titleEs: detail.titleEs,
        })
      })
      .catch(() => setError("No se pudo cargar el resultado de la prueba final."))
      .finally(() => setLoading(false))
  }, [attemptIdValue, testId])

  if (!testId || !attemptIdValue) {
    return <Navigate replace to="/summative" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  if (error || !result || !test) {
    return (
      <PageShell
        subtitle="No fue posible recuperar el resultado solicitado."
        title="Resultado"
      >
        <Alert variant="destructive">
          <AlertTitle>Error de carga</AlertTitle>
          <AlertDescription>{error ?? "No se encontró el resultado solicitado."}</AlertDescription>
        </Alert>
      </PageShell>
    )
  }

  return (
    <PageShell
      actions={<Badge variant={result.passed ? "secondary" : "outline"}>{result.overallScore}/100</Badge>}
      subtitle="Lectura, producción y comprensión consolidadas en una sola vista."
      title="Resultado"
    >
      <Card>
        <CardHeader className="space-y-2">
          <p className="text-sm text-muted-foreground">Resultado sumativo</p>
          <CardTitle>{result.titleEs}</CardTitle>
        </CardHeader>
      </Card>

      <SummativeResultCard result={result} />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tu producción</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap rounded-lg border border-border bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
              {result.productionAnswerEn}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Respuesta esperada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap rounded-lg border border-border bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
              {test.productionExpectedAnswerEn}
            </p>
          </CardContent>
        </Card>
      </div>

      {result.productionFeedbackPayload ? (
        <Card>
          <CardHeader>
            <CardTitle>Feedback de producción</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <h3 className="text-sm font-semibold">Fortalezas</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {result.productionFeedbackPayload.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <h3 className="text-sm font-semibold">Enfoque lingüístico</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {result.productionFeedbackPayload.languageFocusComments}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Revisión de comprensión</h2>
        {result.comprehensionReview.length === 0 ? (
          <EmptyState
            description="No se registraron preguntas de comprensión para este intento."
            icon={FileText}
            title="Sin revisión disponible"
          />
        ) : (
          result.comprehensionReview.map((question, index) => (
            <McqQuestion
              index={index}
              key={`${question.question}-${index}`}
              onChange={() => undefined}
              question={question}
              selectedAnswerIdx={question.selectedAnswerIdx}
              showReview
            />
          ))
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/summative">Volver al listado</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/summative">Elegir otra prueba</Link>
        </Button>
      </div>
    </PageShell>
  )
}
