import type { SummativeResult } from "../../../types/summative"

function scoreClasses(score: number) {
  if (score >= 80) {
    return "bg-emerald-100 text-emerald-800"
  }

  if (score >= 60) {
    return "bg-amber-100 text-amber-800"
  }

  return "bg-red-100 text-red-800"
}

export function SummativeResultCard({ result }: { result: SummativeResult }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Desglose del resultado</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Producción</p>
          <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${scoreClasses(result.productionScore)}`}>
            {result.productionScore}/100
          </span>
          <p className="mt-3 text-xs text-gray-600">Peso: 60%</p>
        </article>
        <article className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Comprensión</p>
          <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${scoreClasses(result.comprehensionScore)}`}>
            {result.comprehensionScore}/100
          </span>
          <p className="mt-3 text-xs text-gray-600">Peso: 40%</p>
        </article>
        <article className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Resultado final</p>
          <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${scoreClasses(result.overallScore)}`}>
            {result.overallScore}/100
          </span>
          <p className="mt-3 text-xs text-gray-600">
            {result.passed ? "Aprobado" : "Aún no aprobado"}
          </p>
        </article>
      </div>
    </section>
  )
}
