import type { GrowthHighlight } from "../../../types/portfolio"

export function GrowthHighlightsList({ items }: { items: GrowthHighlight[] }) {
  if (items.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
        Aún no hay suficientes intentos para generar highlights de crecimiento.
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Highlights de crecimiento</h2>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <article key={`${item.title}-${item.comparedAt}`} className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
            <p className="mt-2 text-sm text-slate-700">{item.beforeText}</p>
            <p className="mt-1 text-sm text-slate-700">{item.afterText}</p>
            <p className="mt-3 text-xs uppercase tracking-wide text-emerald-700">
              Mejora neta: +{item.deltaCount}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
