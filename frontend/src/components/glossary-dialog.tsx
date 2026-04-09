import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ArrowUpRight, BookOpen, Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { ScrollArea } from "./ui/scroll-area"
import { Separator } from "./ui/separator"
import { cn } from "../lib/utils"
import {
  GLOSSARY,
  GLOSSARY_CATEGORIES,
  findGlossaryEntry,
  searchGlossary,
  type GlossaryCategory,
  type GlossaryEntry,
} from "../lib/glossary"

interface GlossaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Global mount: listens for `glossary:open` window event and Cmd+/ shortcut.
 * Place once near the root (e.g. inside Layout) so the dialog is available app-wide.
 */
export function GlossaryProvider() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "/") {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }

    const handleOpen = () => setOpen(true)

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("glossary:open", handleOpen as EventListener)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("glossary:open", handleOpen as EventListener)
    }
  }, [])

  return <GlossaryDialog open={open} onOpenChange={setOpen} />
}

export function GlossaryDialog({ open, onOpenChange }: GlossaryDialogProps) {
  const [query, setQuery] = useState("")
  const [activeTerm, setActiveTerm] = useState<string | null>(null)

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      const timer = window.setTimeout(() => {
        setQuery("")
        setActiveTerm(null)
      }, 200)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [open])

  const activeEntry = useMemo(
    () => (activeTerm ? findGlossaryEntry(activeTerm) : null),
    [activeTerm],
  )

  const grouped = useMemo(() => {
    const filtered = searchGlossary(query)
    const map = new Map<GlossaryCategory, GlossaryEntry[]>()
    for (const entry of filtered) {
      const list = map.get(entry.category) ?? []
      list.push(entry)
      map.set(entry.category, list)
    }
    return Array.from(map.entries())
  }, [query])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(100%-2rem,42rem)] gap-0 p-0 max-h-[min(100vh-3rem,42rem)] overflow-hidden">
        {activeEntry ? (
          <DetailView
            entry={activeEntry}
            onBack={() => setActiveTerm(null)}
            onNavigate={(t) => setActiveTerm(t)}
          />
        ) : (
          <ListView
            query={query}
            onQueryChange={setQuery}
            grouped={grouped}
            totalCount={GLOSSARY.length}
            onSelect={(t) => setActiveTerm(t)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface ListViewProps {
  query: string
  onQueryChange: (q: string) => void
  grouped: [GlossaryCategory, GlossaryEntry[]][]
  totalCount: number
  onSelect: (term: string) => void
}

function ListView({ query, onQueryChange, grouped, totalCount, onSelect }: ListViewProps) {
  const filteredCount = grouped.reduce((sum, [, items]) => sum + items.length, 0)

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-3 border-b border-border px-6 pb-4 pt-6">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-muted-foreground" aria-hidden />
          <DialogTitle className="text-lg font-semibold tracking-tight">Glosario</DialogTitle>
        </div>
        <DialogDescription className="text-sm text-muted-foreground">
          Siglas y conceptos científicos detrás de la plataforma. Haz clic en cualquier término
          para leer una explicación a fondo y ver lecturas externas.
        </DialogDescription>
        <div className="relative">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Buscar en el glosario"
            autoFocus
            className="h-9 pl-9"
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar sigla, expansión o concepto..."
            value={query}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Mostrando {filteredCount} de {totalCount} términos
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-6 px-6 py-5">
          {grouped.length === 0 ? (
            <div className="rounded-md border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
              Sin resultados para "{query}".
            </div>
          ) : (
            grouped.map(([category, entries]) => (
              <section key={category} className="space-y-2">
                <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {GLOSSARY_CATEGORIES[category]}
                </h3>
                <ul className="space-y-1">
                  {entries.map((entry) => (
                    <li key={entry.term}>
                      <button
                        className={cn(
                          "group flex w-full items-start justify-between gap-4 rounded-md border border-transparent px-3 py-2 text-left transition-colors",
                          "hover:border-border hover:bg-accent",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        )}
                        onClick={() => onSelect(entry.term)}
                        type="button"
                      >
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono text-sm font-semibold text-foreground">
                              {entry.term}
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                              {entry.expansion}
                            </span>
                          </div>
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {entry.shortDescription}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

interface DetailViewProps {
  entry: GlossaryEntry
  onBack: () => void
  onNavigate: (term: string) => void
}

function DetailView({ entry, onBack, onNavigate }: DetailViewProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-3 border-b border-border px-6 pb-4 pt-6">
        <Button
          className="-ml-2 h-8 w-fit gap-1.5 px-2 text-xs text-muted-foreground"
          onClick={onBack}
          size="sm"
          variant="ghost"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Volver al glosario
        </Button>
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-baseline gap-2">
            <DialogTitle className="font-mono text-2xl font-semibold tracking-tight">
              {entry.term}
            </DialogTitle>
            <Badge variant="outline">{GLOSSARY_CATEGORIES[entry.category]}</Badge>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            {entry.expansion}
          </DialogDescription>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-6 px-6 py-5">
          <section className="space-y-3 text-sm leading-relaxed text-foreground">
            {entry.longDescription.split("\n\n").map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </section>

          {entry.usedIn.length > 0 ? (
            <section className="space-y-2">
              <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Dónde se usa
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {entry.usedIn.map((place) => (
                  <Badge key={place} variant="secondary">
                    {place}
                  </Badge>
                ))}
              </div>
            </section>
          ) : null}

          {entry.externalLinks.length > 0 ? (
            <section className="space-y-2">
              <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Lecturas externas
              </h4>
              <ul className="space-y-1.5">
                {entry.externalLinks.map((link) => (
                  <li key={link.url}>
                    <a
                      className={cn(
                        "group inline-flex items-start gap-1.5 text-sm text-foreground underline-offset-4 transition-colors",
                        "hover:underline focus-visible:outline-none focus-visible:underline",
                      )}
                      href={link.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {entry.related && entry.related.length > 0 ? (
            <>
              <Separator />
              <section className="space-y-2">
                <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Términos relacionados
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {entry.related.map((relatedTerm) => {
                    const exists = findGlossaryEntry(relatedTerm)
                    if (!exists) return null
                    return (
                      <button
                        className={cn(
                          "rounded-md border border-border px-2.5 py-1 font-mono text-xs font-medium transition-colors",
                          "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        )}
                        key={relatedTerm}
                        onClick={() => onNavigate(relatedTerm)}
                        type="button"
                      >
                        {relatedTerm}
                      </button>
                    )
                  })}
                </div>
              </section>
            </>
          ) : null}
        </div>
      </ScrollArea>
    </div>
  )
}
