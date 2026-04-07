import { Loader2 } from "lucide-react"
import { useState } from "react"
import { Navigate, useNavigate } from "react-router"
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
      setError("Selecciona una opcion antes de continuar.")
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
      setError("No se pudo enviar el diagnostico.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4 text-sm text-gray-500">
          <span>
            Pregunta {currentIndex + 1} de {items.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <span>{currentItem.skill}</span>
          <span>·</span>
          <span>{currentItem.cefrLevel}</span>
          {currentItem.difficulty !== undefined ? (
            <>
              <span>·</span>
              <DifficultyBadge difficulty={currentItem.difficulty ?? null} />
            </>
          ) : null}
        </div>
        <h1 className="text-xl font-semibold leading-8 text-gray-900">
          {currentItem.questionText}
        </h1>

        <div className="mt-6 grid gap-3">
          {currentItem.options.map((option, optionIndex) => {
            const checked = selectedAnswer === optionIndex
            return (
              <button
                key={option}
                type="button"
                onClick={() => answerQuestion(currentIndex, optionIndex)}
                className={`rounded-2xl border p-4 text-left text-sm transition ${
                  checked
                    ? "border-blue-500 bg-blue-50 text-blue-900"
                    : "border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50/40"
                }`}
              >
                <span className="font-semibold">
                  {String.fromCharCode(65 + optionIndex)}.
                </span>{" "}
                {option}
              </button>
            )
          })}
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleNext}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isLastStep ? "Enviar diagnóstico" : "Siguiente"}
          </button>
        </div>
      </section>
    </div>
  )
}
