import type { PortfolioResponse } from "../../../types/portfolio"

export function PortfolioSummaryCard({ portfolio }: { portfolio: PortfolioResponse }) {
  const metrics = [
    { label: "Tareas completadas", value: portfolio.tasksCompleted },
    { label: "Reescrituras", value: portfolio.tasksWithRewrite },
    { label: "Vocabulario técnico", value: portfolio.vocabularySize },
    { label: "KCs dominados", value: portfolio.kcMasteredCount },
    { label: "Pruebas aprobadas", value: portfolio.summativeTestsPassed },
    { label: "Promedio sumativo", value: Math.round(portfolio.summativeAvgScore) },
  ]

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Resumen del portafolio</h2>
          <p className="mt-1 text-sm text-slate-600">
            Snapshot auto-colectado del desempeño reciente y del crecimiento técnico.
          </p>
        </div>
        <div className="rounded-2xl bg-blue-50 px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-wide text-blue-700">Aceptación de rewrite</p>
          <p className="text-2xl font-semibold text-blue-950">
            {Math.round(portfolio.rewriteAcceptanceRate * 100)}%
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{metric.value}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
