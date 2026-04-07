import { VerificationScoreBadge } from "./VerificationScoreBadge"

export function AgentScoreCard({
  title,
  score,
  notes,
  passed,
}: {
  title: string
  score: number | null
  notes: string | null
  passed: boolean
}) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-xs text-gray-500">
            {passed ? "Aprobado" : "Observado"}
          </p>
        </div>
        <VerificationScoreBadge score={score} />
      </div>
      <p className="mt-4 text-sm leading-6 text-gray-600">
        {notes && notes.trim().length > 0 ? notes : "Sin observaciones."}
      </p>
    </article>
  )
}
