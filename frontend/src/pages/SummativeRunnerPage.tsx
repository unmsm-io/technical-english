import { Loader2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router"
import { PageShell } from "../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { EmptyState } from "../components/ui/empty-state"
import { Textarea } from "../components/ui/textarea"
import { SummativeApi } from "../features/summative/SummativeApi"
import { McqQuestion } from "../features/summative/components/McqQuestion"
import { SpecReader } from "../features/summative/components/SpecReader"
import { SummativePhaseStepper } from "../features/summative/components/SummativePhaseStepper"
import { useSummativeStore } from "../features/summative/summativeStore"

function phaseLabel(phase: string | null) {
  if (phase === "READING") return "Lectura"
  if (phase === "PRODUCTION") return "Producción"
  if (phase === "COMPREHENSION") return "Comprensión"
  if (phase === "COMPLETED") return "Resultado"
  return "Prueba final"
}

export function SummativeRunnerPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const currentTest = useSummativeStore((state) => state.currentTest)
  const currentAttempt = useSummativeStore((state) => state.currentAttempt)
  const currentPhase = useSummativeStore((state) => state.currentPhase)
  const productionAnswer = useSummativeStore((state) => state.productionAnswer)
  const comprehensionAnswers = useSummativeStore((state) => state.comprehensionAnswers)
  const isSubmitting = useSummativeStore((state) => state.isSubmitting)
  const storeError = useSummativeStore((state) => state.error)
  const startSession = useSummativeStore((state) => state.startSession)
  const setPhase = useSummativeStore((state) => state.setPhase)
  const setProductionAnswer = useSummativeStore((state) => state.setProductionAnswer)
  const setComprehensionAnswer = useSummativeStore((state) => state.setComprehensionAnswer)
  const submitProduction = useSummativeStore((state) => state.submitProduction)
  const submitComprehension = useSummativeStore((state) => state.submitComprehension)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const testId = Number(id)
  const selectedUserId = Number(searchParams.get("userId") ?? "")
  const attemptId = Number(searchParams.get("attemptId") ?? "")

  useEffect(() => {
    if (!testId || !selectedUserId) {
      setError("Selecciona un usuario para iniciar la prueba final.")
      setLoading(false)
      return
    }

    const existingSession = currentTest?.id === testId && (attemptId === 0 || currentAttempt?.id === attemptId)
    if (existingSession && currentAttempt) {
      setLoading(false)
      return
    }

    const loadSession = async () => {
      try {
        const test = await SummativeApi.getById(testId)
        const attempt =
          attemptId > 0
            ? await SummativeApi.getAttempt(attemptId)
            : await SummativeApi.startAttempt(selectedUserId, testId)
        startSession(test, attempt)
      } catch {
        setError("No se pudo cargar la prueba final solicitada.")
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [attemptId, currentAttempt, currentTest, selectedUserId, startSession, testId])

  useEffect(() => {
    if (!currentAttempt || currentAttempt.currentPhase !== "COMPLETED") {
      return
    }

    navigate(`/summative/${currentAttempt.testId}/result/${currentAttempt.id}`, {
      replace: true,
    })
  }, [currentAttempt, navigate])

  const unansweredCount = useMemo(() => {
    if (!currentTest) {
      return 0
    }

    return currentTest.comprehensionQuestions.filter((_, index) => comprehensionAnswers[index] === undefined).length
  }, [comprehensionAnswers, currentTest])

  if (!testId) {
    return <Navigate replace to="/summative" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  if (error || !currentTest || !currentAttempt || !currentPhase) {
    return (
      <PageShell
        subtitle="No fue posible preparar el flujo sumativo."
        title="Prueba final"
      >
        <Alert variant="destructive">
          <AlertTitle>Error de sesión</AlertTitle>
          <AlertDescription>{error ?? "No se encontró una sesión sumativa activa."}</AlertDescription>
        </Alert>
      </PageShell>
    )
  }

  const handleAdvanceToProduction = async () => {
    try {
      const updatedAttempt = await SummativeApi.advancePhase(currentAttempt.id, "PRODUCTION")
      startSession(currentTest, updatedAttempt)
      setPhase("PRODUCTION")
    } catch {
      setError("No se pudo avanzar a la fase de producción.")
    }
  }

  const handleProductionSubmit = async () => {
    try {
      await submitProduction()
    } catch {
      return
    }
  }

  const handleComprehensionSubmit = async () => {
    if (unansweredCount > 0) {
      setError("Debes responder todas las preguntas antes de enviar la comprensión.")
      return
    }

    try {
      const result = await submitComprehension()
      navigate(`/summative/${result.testId}/result/${result.attemptId}`)
    } catch {
      return
    }
  }

  return (
    <PageShell
      subtitle={currentTest.descriptionEs}
      title={currentTest.titleEs}
    >
      <SummativePhaseStepper phase={currentPhase} />

      {storeError ? (
        <Alert variant="destructive">
          <AlertTitle>Error del flujo</AlertTitle>
          <AlertDescription>{storeError}</AlertDescription>
        </Alert>
      ) : null}

      {currentPhase === "READING" ? (
        <>
          <SpecReader
            instructionEs={currentTest.readingContextEs}
            specEn={currentTest.readingSpecEn}
            title="Lee el material técnico"
          />
          <Card>
            <CardHeader>
              <CardTitle>Qué producirás después</CardTitle>
              <CardDescription>{currentTest.productionInstructionEs}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleAdvanceToProduction}>Continuar a producción</Button>
            </CardContent>
          </Card>
        </>
      ) : null}

      {currentPhase === "PRODUCTION" ? (
        <Card>
          <CardHeader>
            <CardTitle>Redacta tu respuesta</CardTitle>
            <CardDescription>{currentTest.productionInstructionEs}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              onChange={(event) => setProductionAnswer(event.target.value)}
              placeholder="Write your answer in English."
              rows={10}
              value={productionAnswer}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button
                disabled={isSubmitting || productionAnswer.trim().length < 20}
                onClick={handleProductionSubmit}
              >
                {isSubmitting ? "Evaluando..." : "Enviar producción"}
              </Button>
              <p className="text-sm text-muted-foreground">
                Usa 2 o 3 frases claras en inglés técnico.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {currentPhase === "COMPREHENSION" ? (
        <div className="space-y-4">
          {currentTest.comprehensionQuestions.length === 0 ? (
            <EmptyState
              description="Esta prueba no trae preguntas de comprensión configuradas."
              icon={Loader2}
              title="Sin preguntas"
            />
          ) : (
            currentTest.comprehensionQuestions.map((question, index) => (
              <McqQuestion
                index={index}
                key={`${question.question}-${index}`}
                onChange={(answerIdx) => setComprehensionAnswer(index, answerIdx)}
                question={question}
                selectedAnswerIdx={comprehensionAnswers[index] ?? null}
              />
            ))
          )}
          <Card>
            <CardContent className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {unansweredCount === 0
                  ? "Todo listo para cerrar la prueba."
                  : `Faltan ${unansweredCount} respuestas por completar.`}
              </p>
              <Button disabled={isSubmitting} onClick={handleComprehensionSubmit}>
                {isSubmitting ? "Guardando..." : "Enviar comprensión"}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button asChild size="sm" variant="ghost">
          <Link to="/summative">{phaseLabel(currentPhase)} · salir</Link>
        </Button>
      </div>
    </PageShell>
  )
}
