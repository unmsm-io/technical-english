import { CheckCircle2, CircleAlert } from "lucide-react"
import type { TaskFeedback } from "../../../types/task"

interface FeedbackPanelProps {
  feedback: TaskFeedback
}

function getScoreBadgeClasses(score: number) {
  if (score >= 80) {
    return "bg-emerald-100 text-emerald-800"
  }

  if (score >= 50) {
    return "bg-amber-100 text-amber-800"
  }

  return "bg-red-100 text-red-800"
}

export function FeedbackPanel({ feedback }: FeedbackPanelProps) {
  const payload = feedback.llmFeedbackPayload

  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Puntaje</p>
          <h2 className="mt-1 text-xl font-semibold text-gray-900">
            Feedback de la tarea
          </h2>
        </div>
        <span
          className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold ${getScoreBadgeClasses(
            feedback.score
          )}`}
        >
          {feedback.score}/100
        </span>
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Fortalezas
        </h3>
        <div className="space-y-2">
          {payload.strengths.map((strength) => (
            <div
              key={strength}
              className="flex gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{strength}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Ajustes sugeridos
        </h3>
        <div className="space-y-3">
          {payload.errors.length > 0 ? (
            payload.errors.map((error) => (
              <div
                key={`${error.original}-${error.fix}`}
                className="rounded-xl border border-amber-200 bg-amber-50 p-4"
              >
                <div className="flex gap-3">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      <span className="line-through decoration-red-500">
                        {error.original}
                      </span>
                      <span className="mx-2 text-gray-400">→</span>
                      <span className="rounded bg-white px-2 py-1 font-medium text-emerald-700">
                        {error.fix}
                      </span>
                    </p>
                    <p className="text-gray-600">{error.rule}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              No se detectaron errores relevantes en esta respuesta.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Tu respuesta
          </h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-700">
            {feedback.userAnswerEn}
          </p>
        </article>
        <article className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Versión mejorada
          </h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-blue-900">
            {payload.improvedAnswer}
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Enfoque lingüístico
        </h3>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
          {payload.languageFocusComments}
        </p>
      </section>
    </div>
  )
}
