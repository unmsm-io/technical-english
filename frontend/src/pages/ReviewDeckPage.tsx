import { ChevronLeft, ChevronRight, RotateCcw, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router"
import { getUsers } from "../api/users"
import { PageShell } from "../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { EmptyState } from "../components/ui/empty-state"
import { Input } from "../components/ui/input"
import { MetricCard } from "../components/ui/metric-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { Skeleton } from "../components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { ReviewApi } from "../features/review/ReviewApi"
import { StabilityHeatmap } from "../features/review/components/StabilityHeatmap"
import { CefrBadge } from "../features/vocabulary/components/CefrBadge"
import { LayerBadge } from "../features/vocabulary/components/LayerBadge"
import type { User } from "../types"
import type { RetentionTier, ReviewCard, ReviewCardState, ReviewStats } from "../types/review"
import type { VocabularyLayer } from "../types/vocabulary"

const stateOptions: Array<{ label: string; value: ReviewCardState | "" }> = [
  { value: "", label: "Todos los estados" },
  { value: "NEW", label: "NEW" },
  { value: "LEARNING", label: "LEARNING" },
  { value: "REVIEW", label: "REVIEW" },
  { value: "RELEARNING", label: "RELEARNING" },
]

const tierOptions: Array<{ label: string; value: RetentionTier | "" }> = [
  { value: "", label: "Todos los tiers" },
  { value: "GENERAL", label: "GENERAL" },
  { value: "TECHNICAL_CORE", label: "TECHNICAL_CORE" },
]

const layerOptions: Array<{ label: string; value: VocabularyLayer | "" }> = [
  { value: "", label: "Todas las capas" },
  { value: "GSL", label: "GSL" },
  { value: "AWL", label: "AWL" },
  { value: "EEWL", label: "EEWL" },
  { value: "CSAWL", label: "CSAWL" },
]

function formatDueDate(value: string) {
  const dueDate = new Date(value)
  const now = new Date()
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / 86400000)

  if (diffDays <= 0) {
    return "Hoy"
  }

  if (diffDays === 1) {
    return "En 1 día"
  }

  return `En ${diffDays} días`
}

export function ReviewDeckPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [cards, setCards] = useState<ReviewCard[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = Number(searchParams.get("userId") ?? "")
  const page = Number(searchParams.get("page") ?? "0")
  const query = searchParams.get("q") ?? ""
  const state = (searchParams.get("state") as ReviewCardState | null) ?? ""
  const tier = (searchParams.get("tier") as RetentionTier | null) ?? ""
  const layer = (searchParams.get("layer") as VocabularyLayer | null) ?? ""

  useEffect(() => {
    getUsers(0, 100).then((pageData) => setUsers(pageData.content)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      setCards([])
      setStats(null)
      return
    }

    setLoading(true)
    setError(null)

    Promise.all([
      ReviewApi.getDeck({
        layer: layer || undefined,
        page,
        q: query || undefined,
        size: 12,
        state: state || undefined,
        tier: tier || undefined,
        userId,
      }),
      ReviewApi.getStats(userId),
    ])
      .then(([deck, reviewStats]) => {
        setCards(deck.content)
        setTotalPages(deck.totalPages || 1)
        setStats(reviewStats)
      })
      .catch(() => setError("No se pudo cargar el deck de repaso."))
      .finally(() => setLoading(false))
  }, [layer, page, query, state, tier, userId])

  const selectedUser = useMemo(
    () => users.find((user) => user.id === userId) ?? null,
    [userId, users]
  )

  const updateParam = (name: string, value: string) => {
    const next = new URLSearchParams(searchParams)

    if (value) {
      next.set(name, value)
    } else {
      next.delete(name)
    }

    if (name !== "page") {
      next.set("page", "0")
    }

    setSearchParams(next, { replace: true })
  }

  const refreshDeck = async () => {
    if (!userId) {
      return
    }

    const deck = await ReviewApi.getDeck({ page, size: 12, userId })
    setCards(deck.content)
  }

  return (
    <PageShell
      actions={
        <Button asChild>
          <Link to={userId ? `/review/session?userId=${userId}` : "/review/session"}>
            Abrir sesión
          </Link>
        </Button>
      }
      subtitle="Filtra tarjetas, revisa vencimientos y reinicia cards para demos o recalibración."
      title="Deck de repaso"
    >
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_180px_180px_180px]">
          <Select onValueChange={(value) => updateParam("userId", value === "none" ? "" : value)} value={userId ? String(userId) : "none"}>
            <SelectTrigger aria-label="Usuario para deck">
              <SelectValue placeholder="Selecciona un usuario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Selecciona un usuario</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={String(user.id)}>
                  {user.firstName} {user.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              onChange={(event) => updateParam("q", event.target.value)}
              placeholder="Buscar término o definición"
              value={query}
            />
          </div>

          <Select onValueChange={(value) => updateParam("state", value === "all" ? "" : value)} value={state || "all"}>
            <SelectTrigger aria-label="Filtrar deck por estado">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {stateOptions.filter((option) => option.value).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => updateParam("tier", value === "all" ? "" : value)} value={tier || "all"}>
            <SelectTrigger aria-label="Filtrar deck por tier">
              <SelectValue placeholder="Todos los tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tiers</SelectItem>
              {tierOptions.filter((option) => option.value).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => updateParam("layer", value === "all" ? "" : value)} value={layer || "all"}>
            <SelectTrigger aria-label="Filtrar deck por capa">
              <SelectValue placeholder="Todas las capas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las capas</SelectItem>
              {layerOptions.filter((option) => option.value).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedUser && stats ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total cards" value={stats.totalCards} />
          <MetricCard label="Para hoy" value={stats.dueToday} />
          <MetricCard label="En learning" value={stats.byState.LEARNING ?? 0} />
          <MetricCard label="Retention" value={`${stats.retentionRate}%`} />
        </div>
      ) : null}

      {userId && cards.length > 0 ? <StabilityHeatmap cards={cards} stats={stats ?? undefined} /> : null}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton className="h-16 w-full" key={index} />
              ))}
            </div>
          ) : !userId ? (
            <div className="p-6">
              <EmptyState
                description="Elige un estudiante para cargar su deck y los vencimientos asociados."
                icon={Search}
                title="Selecciona un usuario"
              />
            </div>
          ) : error ? (
            <div className="p-6">
              <Alert variant="destructive">
                <AlertTitle>Error de carga</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          ) : cards.length === 0 ? (
            <div className="p-6">
              <EmptyState
                description="Ajusta búsqueda, estado, tier o capa para encontrar otro subconjunto del deck."
                icon={Search}
                title="No hay tarjetas para estos filtros"
              />
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Término</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Estabilidad</TableHead>
                      <TableHead>Próximo repaso</TableHead>
                      <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cards.map((card) => (
                      <TableRow key={card.id}>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{card.vocabularyItem.term}</span>
                            <LayerBadge layer={card.vocabularyItem.layer} />
                            <CefrBadge level={card.vocabularyItem.cefrLevel} />
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">{card.vocabularyItem.definition}</p>
                        </TableCell>
                        <TableCell><Badge variant="secondary">{card.state}</Badge></TableCell>
                        <TableCell><Badge variant="outline">{card.retentionTier}</Badge></TableCell>
                        <TableCell className="tabular-nums">{card.stability.toFixed(2)} d</TableCell>
                        <TableCell className="text-muted-foreground">{formatDueDate(card.due)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={async () => {
                              await ReviewApi.resetCard(card.id)
                              await refreshDeck()
                            }}
                            size="sm"
                            variant="outline"
                          >
                            <RotateCcw className="size-4" />
                            Reset
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-3 p-4 md:hidden">
                {cards.map((card) => (
                  <Card key={card.id}>
                    <CardContent className="space-y-4 pt-6">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{card.vocabularyItem.term}</span>
                          <LayerBadge layer={card.vocabularyItem.layer} />
                          <CefrBadge level={card.vocabularyItem.cefrLevel} />
                        </div>
                        <p className="text-sm text-muted-foreground">{card.vocabularyItem.definition}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{card.state}</Badge>
                        <Badge variant="outline">{card.retentionTier}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Estabilidad</p>
                          <p className="font-medium tabular-nums">{card.stability.toFixed(2)} d</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Próximo repaso</p>
                          <p className="font-medium">{formatDueDate(card.due)}</p>
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        onClick={async () => {
                          await ReviewApi.resetCard(card.id)
                          await refreshDeck()
                        }}
                        variant="outline"
                      >
                        <RotateCcw className="size-4" />
                        Reset
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-border px-4 py-4 text-sm text-muted-foreground sm:px-6">
                <span>{selectedUser ? `Deck de ${selectedUser.firstName}` : "Deck"}</span>
                <div className="flex items-center gap-2">
                  <Button
                    disabled={page <= 0}
                    onClick={() => updateParam("page", String(Math.max(page - 1, 0)))}
                    size="sm"
                    variant="outline"
                  >
                    <ChevronLeft className="size-4" />
                    Anterior
                  </Button>
                  <span className="tabular-nums">Página {page + 1} de {totalPages}</span>
                  <Button
                    disabled={page + 1 >= totalPages}
                    onClick={() => updateParam("page", String(page + 1))}
                    size="sm"
                    variant="outline"
                  >
                    Siguiente
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </PageShell>
  )
}
