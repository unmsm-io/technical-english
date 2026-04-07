import { ArrowRight, BookOpenCheck } from "lucide-react"
import { Navigate, Link } from "react-router"
import { useDiagnosticStore } from "../features/diagnostic/diagnosticStore"
import { CefrBadge } from "../features/vocabulary/components/CefrBadge"

export function DiagnosticResultPage() {
  const result = useDiagnosticStore((state) => state.result)
  const selectedUserId = useDiagnosticStore((state) => state.selectedUserId)

  if (!result) {
    return <Navigate to="/diagnostic/start" replace />
  }

  const maxBreakdownValue = Math.max(...Object.values(result.perLevelBreakdown), 1)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Resultado del diagnóstico</h1>
        <p className="text-sm text-gray-600">
          El placement se calculó según el mayor nivel con al menos 2 respuestas
          correctas sobre 3 items.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-wide text-gray-500">
              Placement recomendado
            </p>
            <div className="inline-flex rounded-2xl bg-blue-50 px-4 py-3">
              <CefrBadge level={result.placedLevel} />
            </div>
            <p className="text-sm text-gray-600">
              Respuestas correctas: {result.correctCount} de {result.totalItems}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard label="Tamaño vocabular estimado" value={`${result.vocabularySize}`} />
            <StatCard
              label="Diagnóstico completado"
              value={new Date(result.completedAt).toLocaleDateString()}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Desglose por nivel</h2>
        <div className="mt-5 space-y-4">
          {Object.entries(result.perLevelBreakdown).map(([level, score]) => (
            <div key={level} className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-700">
                <span>{level}</span>
                <span>{score} correctas</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${(score / maxBreakdownValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to={`/vocabulary?cefrLevel=${result.placedLevel}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <BookOpenCheck className="h-4 w-4" />
          Ver vocabulario de este nivel
        </Link>
        {selectedUserId ? (
          <Link
            to={`/users/${selectedUserId}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Ir al perfil
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}
