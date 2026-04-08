import { Loader2 } from "lucide-react"
import { useState } from "react"
import { Navigate, useNavigate } from "react-router"
import { PageShell } from "../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Progress } from "../components/ui/progress"
import { submitDiagnostic } from "../features/diagnostic/DiagnosticApi"
import { useDiagnosticStore } from "../features/diagnostic/diagnosticStore"
import { DifficultyBadge } from "../features/admin/components/DifficultyBadge"

export function DiagnosticTestPage() {
  const navigate = useNavigate()
  const attemptId = useDiagnosticStore((state) => state.attemptId)
  const items = useDiagnosticStore((state) => state.items)
  const responses = useDiagnosticStore((state) => state.responses)
  const answerQuestion = useDiagnosticStore((state) => state.answerQuestion)
  const setResult = useDiagnosticStore((state) => state.setResult)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!attemptId || items.length === 0) {
    return <Navigate to="/diagnostic/start" replace />
  }

  const currentItem = items[currentIndex]
  const selectedAnswer = responses[currentIndex]
  const progress = ((currentIndex + 1) / items.length) * 100
  const isLastStep = currentIndex === items.length - 1

  const handleNext = async () => {
    if (selectedAnswer === null) {
      setError("Selecciona una opción antes de continuar.")
      return
    }

    if (!isLastStep) {
      setError(null)
      setCurrentIndex((value) => value + 1)
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const result = await submitDiagnostic(
        attemptId,
        responses.map((value) => value ?? -1)
      )
      setResult(result)
      navigate("/diagnostic/result")
    } catch {
      setError("No se pudo enviar el diagnóstico.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell
      subtitle="Responde cada ítem sin volver atrás para estimar el nivel CEFR inicial del estudiante."
      title="Diagnóstico adaptativo"
    >
      <Card>
        <CardHeader className="gap-4">
          <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>Pregunta {currentIndex + 1} de {items.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span>{currentItem.skill}</span>
            <span>•</span>
            <span>{currentItem.cefrLevel}</span>
            {currentItem.difficulty !== undefined ? (
              <>
                <span>•</span>
                <DifficultyBadge difficulty={currentItem.difficulty ?? null} />
              </>
            ) : null}
          </div>
          <CardTitle className="text-2xl leading-8">{currentItem.questionText}</CardTitle>
          <CardDescription>Selecciona la alternativa que mejor completa la situación.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3">
            {currentItem.options.map((option, optionIndex) => {
              const checked = selectedAnswer === optionIndex
              return (
                <button
                  aria-pressed={checked}
                  className={`rounded-lg border px-4 py-4 text-left text-sm transition ${
                    checked
                      ? "border-foreground bg-accent text-accent-foreground"
                      : "border-border bg-card text-foreground hover:border-ring hover:bg-accent/60"
                  }`}
                  key={option}
                  onClick={() => answerQuestion(currentIndex, optionIndex)}
                  type="button"
                >
                  <span className="mr-2 font-semibold">{String.fromCharCode(65 + optionIndex)}.</span>
                  {option}
                </button>
              )
            })}
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertTitle>No se pudo continuar</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex justify-end">
            <Button disabled={submitting} onClick={handleNext}>
              {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {isLastStep ? "Enviar diagnóstico" : "Siguiente"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
