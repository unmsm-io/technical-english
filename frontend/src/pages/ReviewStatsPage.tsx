import { Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router"
import { getUsers } from "../api/users"
import { PageShell } from "../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Badge } from "../components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { EmptyState } from "../components/ui/empty-state"
import { MetricCard } from "../components/ui/metric-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { Skeleton } from "../components/ui/skeleton"
import { ReviewApi } from "../features/review/ReviewApi"
import { StabilityHeatmap } from "../features/review/components/StabilityHeatmap"
import { StreakIndicator } from "../features/review/components/StreakIndicator"
import type { User } from "../types"
import type { ReviewCard, ReviewStats } from "../types/review"

function WeeklyRetentionChart({ stats }: { stats: ReviewStats }) {
  const points = stats.weeklyRetention
  const width = 520
  const height = 220
  const padding = 28
  const maxValue = Math.max(100, ...points.map((point) => point.retentionRate))

  if (points.length === 0) {
    return (
      <EmptyState
        description="El sistema necesita más semanas de repaso registradas para construir la curva."
        icon={Search}
        title="Sin datos semanales"
      />
    )
  }

  const path = points
    .map((point, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(points.length - 1, 1)
      const y = height - padding - (point.retentionRate / maxValue) * (height - padding * 2)
      return `${index === 0 ? "M" : "L"} ${x} ${y}`
    })
    .join(" ")

  return (
    <div className="space-y-4">
      <svg className="w-full" viewBox={`0 0 ${width} ${height}`}>
        <path
          d={`M ${padding} ${height - padding} H ${width - padding}`}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="1.5"
        />
        <path d={path} fill="none" stroke="var(--color-foreground)" strokeLinecap="round" strokeWidth="3" />
        {points.map((point, index) => {
          const x = padding + (index * (width - padding * 2)) / Math.max(points.length - 1, 1)
          const y = height - padding - (point.retentionRate / maxValue) * (height - padding * 2)
          return (
            <circle
              cx={x}
              cy={y}
              fill="var(--color-background)"
              key={point.weekLabel}
              r="4.5"
              stroke="var(--color-foreground)"
              strokeWidth="2"
            />
          )
        })}
      </svg>
      <div className="grid gap-2 sm:grid-cols-4">
        {points.map((point) => (
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm" key={point.weekLabel}>
            <p className="font-medium">{point.weekLabel}</p>
            <p className="text-muted-foreground">{point.retentionRate}%</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ReviewStatsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [deck, setDeck] = useState<ReviewCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = Number(searchParams.get("userId") ?? "")

  useEffect(() => {
    getUsers(0, 100).then((page) => setUsers(page.content)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      setStats(null)
      setDeck([])
      return
    }

    setLoading(true)
    setError(null)
    Promise.all([
      ReviewApi.getStats(userId),
      ReviewApi.getDeck({ page: 0, size: 100, userId }),
    ])
      .then(([reviewStats, deckPage]) => {
        setStats(reviewStats)
        setDeck(deckPage.content)
      })
      .catch(() => setError("No se pudieron cargar las estadísticas de repaso."))
      .finally(() => setLoading(false))
  }, [userId])

  const selectedUser = useMemo(
    () => users.find((user) => user.id === userId) ?? null,
    [userId, users]
  )

  return (
    <PageShell
      subtitle="Retención, estabilidad y distribución del deck en una sola vista."
      title="Estadísticas de repaso"
    >
      <Card>
        <CardHeader>
          <CardTitle>Usuario</CardTitle>
        </CardHeader>
        <CardContent className="max-w-sm">
          <Select
            onValueChange={(value) => setSearchParams(value === "none" ? {} : { userId: value }, { replace: true })}
            value={userId ? String(userId) : "none"}
          >
            <SelectTrigger aria-label="Usuario para estadísticas">
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
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton className="h-32 w-full" key={index} />
            ))}
          </div>
          <Skeleton className="h-40 w-full" />
          <div className="grid gap-6 xl:grid-cols-2">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      ) : !userId ? (
        <EmptyState
          description="Elige un usuario para ver retención reciente, estabilidad y tarjetas con más fallos."
          icon={Search}
          title="Selecciona un usuario"
        />
      ) : error || !stats ? (
        <Alert variant="destructive">
          <AlertTitle>Error de carga</AlertTitle>
          <AlertDescription>{error ?? "No se encontraron estadísticas."}</AlertDescription>
        </Alert>
      ) : (
        <>
          {selectedUser ? (
            <Alert>
              <AlertTitle>
                {selectedUser.firstName} {selectedUser.lastName}
              </AlertTitle>
              <AlertDescription>
                Analítica consolidada del deck activo y de su historial reciente de repaso.
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Cards para hoy" value={stats.dueToday} />
            <MetricCard label="Retention 30d" value={`${stats.retentionRate}%`} />
            <MetricCard label="Avg stability" value={`${stats.avgStability} d`} />
            <MetricCard label="Deck total" value={stats.totalCards} />
          </div>

          <StreakIndicator longestStreak={stats.longestStreak} retentionRate={stats.retentionRate} />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <StabilityHeatmap cards={deck} stats={stats} />
            <Card>
              <CardHeader>
                <CardTitle>Retención semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <WeeklyRetentionChart stats={stats} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por estado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(stats.byState).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{key}</span>
                      <span className="tabular-nums">{value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-foreground/80"
                        style={{
                          width: `${stats.totalCards === 0 ? 0 : Math.max((value / stats.totalCards) * 100, 4)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 10 con más fallos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.topFailedCards.length > 0 ? (
                  stats.topFailedCards.map((card) => (
                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3" key={card.cardId}>
                      <div>
                        <p className="font-medium">{card.term}</p>
                        <p className="text-sm text-muted-foreground">{card.layer}</p>
                      </div>
                      <Badge variant="outline">{card.lapses} lapses</Badge>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    description="Cuando existan lapses registrados, aparecerán aquí para ayudarte a priorizar revisión."
                    icon={Search}
                    title="Sin tarjetas problemáticas"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </PageShell>
  )
}
