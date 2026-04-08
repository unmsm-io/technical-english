import type { PortfolioTimelineEntry } from "../../../types/portfolio"

export function PortfolioTimeline({ entries }: { entries: PortfolioTimelineEntry[] }) {
  if (entries.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
        Aún no hay actividad registrada en la línea de tiempo.
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Timeline</h2>
      <div className="mt-5 space-y-4">
        {entries.slice(0, 8).map((entry) => (
          <div key={`${entry.type}-${entry.date}-${entry.title}`} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={`h-3 w-3 rounded-full ${
                  entry.type === "SUMMATIVE" ? "bg-indigo-500" : "bg-emerald-500"
                }`}
              />
              <span className="mt-1 h-full w-px bg-slate-200" />
            </div>
            <article className="flex-1 rounded-2xl bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-slate-900">{entry.title}</p>
                <span className="text-xs uppercase tracking-wide text-slate-500">
                  {new Date(entry.date).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{entry.snippet || "Sin extracto"}</p>
              <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">
                {entry.type} {entry.score !== null ? `· ${entry.score}/100` : ""}
              </p>
            </article>
          </div>
        ))}
      </div>
    </section>
  )
}
