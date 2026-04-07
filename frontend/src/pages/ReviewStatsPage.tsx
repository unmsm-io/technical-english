import { Loader2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router"
import { getUsers } from "../api/users"
import { ReviewApi } from "../features/review/ReviewApi"
import { StabilityHeatmap } from "../features/review/components/StabilityHeatmap"
import { StreakIndicator } from "../features/review/components/StreakIndicator"
import type { User } from "../types"
import type { ReviewCard, ReviewStats } from "../types/review"

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
      return
    }

    setLoading(true)
    setError(null)
    Promise.all([
      ReviewApi.getStats(userId),
      ReviewApi.getDeck({ userId, page: 0, size: 100 }),
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
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Estadísticas de repaso</h1>
        <p className="text-sm text-slate-600">
          Observa retención reciente, estabilidad promedio y las palabras que más cuestan.
        </p>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <select
          aria-label="Usuario para estadísticas"
          value={userId || ""}
          onChange={(event) => {
            const value = event.target.value
            setSearchParams(value ? { userId: value } : {}, { replace: true })
          }}
          className="w-full max-w-sm rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
        >
          <option value="">Selecciona un usuario</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.firstName} {user.lastName}
            </option>
          ))}
        </select>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
        </div>
      ) : !userId ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center text-sm text-slate-600">
          Selecciona un usuario para ver su analítica de repaso.
        </div>
      ) : error || !stats ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-16 text-center text-sm text-red-700">
          {error ?? "No se encontraron estadísticas."}
        </div>
      ) : (
        <>
          {selectedUser ? (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-900">
              Analítica de {selectedUser.firstName} {selectedUser.lastName}.
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Cards para hoy" value={stats.dueToday} />
            <MetricCard label="Retention 30d" value={`${stats.retentionRate}%`} />
            <MetricCard label="Avg stability" value={`${stats.avgStability} d`} />
            <MetricCard label="Deck total" value={stats.totalCards} />
          </div>

          <StreakIndicator
            longestStreak={stats.longestStreak}
            retentionRate={stats.retentionRate}
          />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <StabilityHeatmap cards={deck} stats={stats} />
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Retención semanal</h2>
              <WeeklyRetentionChart stats={stats} />
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Distribución por estado</h2>
              <div className="mt-5 space-y-3">
                {Object.entries(stats.byState).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm text-slate-700">
                      <span>{key}</span>
                      <span>{value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${stats.totalCards === 0 ? 0 : Math.max((value / stats.totalCards) * 100, 4)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Top 10 con más fallos</h2>
              <div className="mt-5 space-y-3">
                {stats.topFailedCards.length > 0 ? (
                  stats.topFailedCards.map((card) => (
                    <div
                      key={card.cardId}
                      className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{card.term}</p>
                        <p className="text-slate-500">{card.layer}</p>
                      </div>
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                        {card.lapses} lapses
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    Todavía no hay tarjetas con fallos registrados.
                  </p>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function WeeklyRetentionChart({ stats }: { stats: ReviewStats }) {
  const width = 480
  const height = 220
  const padding = 24
  const points = stats.weeklyRetention
  const maxValue = Math.max(100, ...points.map((point) => point.retentionRate))

  if (points.length === 0) {
    return <p className="mt-5 text-sm text-slate-500">Aún no hay datos semanales para graficar.</p>
  }

  const path = points
    .map((point, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(points.length - 1, 1)
      const y = height - padding - (point.retentionRate / maxValue) * (height - padding * 2)
      return `${index === 0 ? "M" : "L"} ${x} ${y}`
    })
    .join(" ")

  return (
    <div className="mt-5 space-y-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <path d={path} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
        {points.map((point, index) => {
          const x = padding + (index * (width - padding * 2)) / Math.max(points.length - 1, 1)
          const y = height - padding - (point.retentionRate / maxValue) * (height - padding * 2)
          return <circle key={point.weekLabel} cx={x} cy={y} r="4" fill="#1d4ed8" />
        })}
      </svg>
      <div className="grid gap-2 text-xs text-slate-500 sm:grid-cols-4">
        {points.map((point) => (
          <div key={point.weekLabel} className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="font-medium text-slate-700">{point.weekLabel}</p>
            <p>{point.retentionRate}%</p>
          </div>
        ))}
      </div>
    </div>
  )
}
