import { EmptyState } from "../../../components/ui/empty-state"
import { Badge } from "../../../components/ui/badge"
import type { PortfolioTimelineEntry } from "../../../types/portfolio"
import { Clock3 } from "lucide-react"

export function PortfolioTimeline({ entries }: { entries: PortfolioTimelineEntry[] }) {
  if (entries.length === 0) {
    return (
      <EmptyState
        description="Aún no hay actividad registrada en la línea de tiempo."
        icon={Clock3}
        title="Timeline vacío"
      />
    )
  }

  return (
    <section className="relative space-y-4 pl-4">
      <div className="absolute bottom-0 left-1.5 top-1.5 w-px bg-border" />
      {entries.slice(0, 8).map((entry) => (
        <article className="relative rounded-lg border border-border bg-card p-4" key={`${entry.type}-${entry.date}-${entry.title}`}>
          <span className="absolute -left-[1.15rem] top-5 size-3 rounded-full border border-background bg-foreground" />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium">{entry.title}</p>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{entry.snippet || "Sin extracto"}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline">{entry.type}</Badge>
            {entry.score !== null ? <Badge variant="secondary">{entry.score}/100</Badge> : null}
          </div>
        </article>
      ))}
    </section>
  )
}
