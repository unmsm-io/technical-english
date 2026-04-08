import { EmptyState } from "../../../components/ui/empty-state"
import type { GrowthHighlight } from "../../../types/portfolio"
import { Quote } from "lucide-react"

export function GrowthHighlightsList({ items }: { items: GrowthHighlight[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        description="Aún no hay suficientes intentos para generar highlights de crecimiento."
        icon={Quote}
        title="Sin highlights"
      />
    )
  }

  return (
    <section className="space-y-3">
      {items.map((item) => (
        <blockquote className="rounded-lg border border-border bg-muted/20 p-4" key={`${item.title}-${item.comparedAt}`}>
          <p className="text-sm font-semibold">{item.title}</p>
          <p className="mt-2 text-sm text-muted-foreground">{item.beforeText}</p>
          <p className="mt-1 text-sm text-muted-foreground">{item.afterText}</p>
          <footer className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Mejora neta: +{item.deltaCount}</footer>
        </blockquote>
      ))}
    </section>
  )
}
