import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, Navigate, useParams } from "react-router"
import { SummativeApi } from "../features/summative/SummativeApi"
import { McqQuestion } from "../features/summative/components/McqQuestion"
import { SummativeResultCard } from "../features/summative/components/SummativeResultCard"
import type { SummativeResult, SummativeTestDetail } from "../types/summative"

function badgeClasses(score: number) {
  if (score >= 80) {
    return "bg-emerald-100 text-emerald-800"
  }

  if (score >= 60) {
    return "bg-amber-100 text-amber-800"
  }

  return "bg-red-100 text-red-800"
}

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
          testId: detail.id,
          titleEs: detail.titleEs,
          taskType: detail.taskType,
          productionScore: attempt.productionScore ?? 0,
          productionAnswerEn: attempt.productionAnswerEn ?? "",
          productionFeedbackPayload: attempt.productionFeedbackPayload,
          comprehensionScore: attempt.comprehensionScore ?? 0,
          overallScore: attempt.overallScore ?? 0,
          passed: attempt.passed ?? false,
          comprehensionReview: detail.comprehensionQuestions.map((question, index) => {
            const response = attempt.comprehensionResponses.find((item) => item.questionIdx === index)
            return {
              ...question,
              selectedAnswerIdx: response?.answerIdx ?? null,
              correct: response?.correct ?? false,
            }
          }),
          completedAt: attempt.completedAt ?? attempt.startedAt,
        })
      })
      .catch(() => setError("No se pudo cargar el resultado de la prueba final."))
      .finally(() => setLoading(false))
  }, [attemptIdValue, testId])

  if (!testId || !attemptIdValue) {
    return <Navigate to="/summative" replace />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !result || !test) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
        <p className="text-sm text-red-700">
          {error ?? "No se encontró el resultado solicitado."}
        </p>
      </div>
    )
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
          <li className="font-medium text-gray-900">Resultado</li>
        </ol>
      </nav>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Resultado sumativo</p>
            <h1 className="mt-1 text-2xl font-semibold text-gray-900">{result.titleEs}</h1>
          </div>
          <span className={`inline-flex w-fit rounded-full px-5 py-2 text-lg font-semibold ${badgeClasses(result.overallScore)}`}>
            {result.overallScore}/100
          </span>
        </div>
      </section>

      <SummativeResultCard result={result} />

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Tu producción</h2>
          <p className="mt-4 whitespace-pre-wrap rounded-2xl bg-gray-50 p-4 text-sm leading-6 text-gray-700">
            {result.productionAnswerEn}
          </p>
        </article>
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Respuesta esperada</h2>
          <p className="mt-4 whitespace-pre-wrap rounded-2xl bg-gray-50 p-4 text-sm leading-6 text-gray-700">
            {test.productionExpectedAnswerEn}
          </p>
        </article>
      </section>

      {result.productionFeedbackPayload ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Feedback de producción</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900">Fortalezas</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {result.productionFeedbackPayload.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="rounded-2xl bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900">Enfoque lingüístico</h3>
              <p className="mt-3 text-sm leading-6 text-gray-700">
                {result.productionFeedbackPayload.languageFocusComments}
              </p>
            </article>
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Revisión de comprensión</h2>
        {result.comprehensionReview.map((question, index) => (
          <McqQuestion
            key={`${question.question}-${index}`}
            index={index}
            question={question}
            selectedAnswerIdx={question.selectedAnswerIdx}
            onChange={() => undefined}
            showReview
          />
        ))}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/summative"
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Volver al listado
        </Link>
        <Link
          to="/summative"
          className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Elegir otra prueba
        </Link>
      </div>
    </div>
  )
}
