import { Loader2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router"
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

    return currentTest.comprehensionQuestions.filter((_, index) => comprehensionAnswers[index] === undefined)
      .length
  }, [comprehensionAnswers, currentTest])

  if (!testId) {
    return <Navigate to="/summative" replace />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !currentTest || !currentAttempt || !currentPhase) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
        <p className="text-sm text-red-700">
          {error ?? "No se encontró una sesión sumativa activa."}
        </p>
      </div>
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
    <div className="mx-auto max-w-6xl space-y-6">
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link to="/" className="transition hover:text-gray-900">
              Inicio
            </Link>
          </li>
          <li>&gt;</li>
          <li>
            <Link to="/summative" className="transition hover:text-gray-900">
              Pruebas finales
            </Link>
          </li>
          <li>&gt;</li>
          <li className="font-medium text-gray-900">{phaseLabel(currentPhase)}</li>
        </ol>
      </nav>

      <div className="space-y-3">
        <SummativePhaseStepper phase={currentPhase} />
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{currentTest.titleEs}</h1>
          <p className="mt-1 text-sm text-gray-600">{currentTest.descriptionEs}</p>
        </div>
      </div>

      {storeError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {storeError}
        </div>
      ) : null}

      {currentPhase === "READING" ? (
        <>
          <SpecReader
            title="Lee el material técnico"
            instructionEs={currentTest.readingContextEs}
            specEn={currentTest.readingSpecEn}
          />
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Qué producirás después</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              {currentTest.productionInstructionEs}
            </p>
            <button
              type="button"
              onClick={handleAdvanceToProduction}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Continuar a producción
            </button>
          </div>
        </>
      ) : null}

      {currentPhase === "PRODUCTION" ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Redacta tu respuesta</h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            {currentTest.productionInstructionEs}
          </p>
          <textarea
            value={productionAnswer}
            onChange={(event) => setProductionAnswer(event.target.value)}
            placeholder="Write your answer in English."
            rows={10}
            className="mt-5 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm leading-6 outline-none transition focus:border-blue-500"
          />
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleProductionSubmit}
              disabled={isSubmitting || productionAnswer.trim().length < 20}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isSubmitting ? "Evaluando..." : "Enviar producción"}
            </button>
            <span className="text-sm text-gray-500">
              Usa 2 o 3 frases claras en inglés técnico.
            </span>
          </div>
        </section>
      ) : null}

      {currentPhase === "COMPREHENSION" ? (
        <div className="space-y-4">
          {currentTest.comprehensionQuestions.map((question, index) => (
            <McqQuestion
              key={`${question.question}-${index}`}
              index={index}
              question={question}
              selectedAnswerIdx={comprehensionAnswers[index] ?? null}
              onChange={(answerIdx) => setComprehensionAnswer(index, answerIdx)}
            />
          ))}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-600">
                {unansweredCount === 0
                  ? "Todo listo para cerrar la prueba."
                  : `Faltan ${unansweredCount} respuestas por completar.`}
              </p>
              <button
                type="button"
                onClick={handleComprehensionSubmit}
                disabled={isSubmitting}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isSubmitting ? "Guardando..." : "Enviar comprensión"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
