import { Loader2, RotateCcw, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router"
import { getUsers } from "../api/users"
import { ReviewApi } from "../features/review/ReviewApi"
import { StabilityHeatmap } from "../features/review/components/StabilityHeatmap"
import { CefrBadge } from "../features/vocabulary/components/CefrBadge"
import { LayerBadge } from "../features/vocabulary/components/LayerBadge"
import type { User } from "../types"
import type { RetentionTier, ReviewCard, ReviewCardState, ReviewStats } from "../types/review"
import type { VocabularyLayer } from "../types/vocabulary"

const stateOptions: Array<{ value: ReviewCardState | ""; label: string }> = [
  { value: "", label: "Todos los estados" },
  { value: "NEW", label: "NEW" },
  { value: "LEARNING", label: "LEARNING" },
  { value: "REVIEW", label: "REVIEW" },
  { value: "RELEARNING", label: "RELEARNING" },
]

const tierOptions: Array<{ value: RetentionTier | ""; label: string }> = [
  { value: "", label: "Todos los tiers" },
  { value: "GENERAL", label: "GENERAL" },
  { value: "TECHNICAL_CORE", label: "TECHNICAL_CORE" },
]

const layerOptions: Array<{ value: VocabularyLayer | ""; label: string }> = [
  { value: "", label: "Todas las capas" },
  { value: "GSL", label: "GSL" },
  { value: "AWL", label: "AWL" },
  { value: "EEWL", label: "EEWL" },
  { value: "CSAWL", label: "CSAWL" },
]

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
  const q = searchParams.get("q") ?? ""
  const state = (searchParams.get("state") as ReviewCardState | null) ?? ""
  const tier = (searchParams.get("tier") as RetentionTier | null) ?? ""
  const layer = (searchParams.get("layer") as VocabularyLayer | null) ?? ""

  useEffect(() => {
    getUsers(0, 100).then((pageData) => setUsers(pageData.content)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    Promise.all([
      ReviewApi.getDeck({
        userId,
        q: q || undefined,
        state: state || undefined,
        tier: tier || undefined,
        layer: layer || undefined,
        page,
        size: 12,
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
  }, [layer, page, q, state, tier, userId])

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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Deck de vocabulario</h1>
        <p className="text-sm text-slate-600">
          Administra las tarjetas activas, filtra por estado y reinicia cards de demostración.
        </p>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_180px_180px_180px]">
          <select
            aria-label="Usuario para deck"
            value={userId || ""}
            onChange={(event) => updateParam("userId", event.target.value)}
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
          >
            <option value="">Selecciona un usuario</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </select>

          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(event) => updateParam("q", event.target.value)}
              placeholder="Buscar término o definición"
              className="w-full rounded-2xl border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500"
            />
          </label>

          <select
            aria-label="Filtrar deck por estado"
            value={state}
            onChange={(event) => updateParam("state", event.target.value)}
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
          >
            {stateOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar deck por tier"
            value={tier}
            onChange={(event) => updateParam("tier", event.target.value)}
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
          >
            {tierOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar deck por capa"
            value={layer}
            onChange={(event) => updateParam("layer", event.target.value)}
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
          >
            {layerOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {selectedUser && stats ? (
        <div className="grid gap-4 lg:grid-cols-4">
          <StatCard label="Total cards" value={stats.totalCards} />
          <StatCard label="Para hoy" value={stats.dueToday} />
          <StatCard label="En learning" value={stats.byState.LEARNING ?? 0} />
          <StatCard label="Retention" value={`${stats.retentionRate}%`} />
        </div>
      ) : null}

      {userId && cards.length > 0 ? <StabilityHeatmap cards={cards} stats={stats ?? undefined} /> : null}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
          </div>
        ) : !userId ? (
          <div className="px-6 py-16 text-center text-sm text-slate-600">
            Selecciona un usuario para ver su deck.
          </div>
        ) : error ? (
          <div className="px-6 py-16 text-center text-sm text-red-600">{error}</div>
        ) : cards.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-slate-600">
            No hay tarjetas que coincidan con los filtros actuales.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Término</th>
                    <th className="px-5 py-3">Estado</th>
                    <th className="px-5 py-3">Tier</th>
                    <th className="px-5 py-3">Estabilidad</th>
                    <th className="px-5 py-3">Próximo repaso</th>
                    <th className="px-5 py-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cards.map((card) => (
                    <tr key={card.id} className="align-top">
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-slate-900">{card.vocabularyItem.term}</span>
                          <LayerBadge layer={card.vocabularyItem.layer} />
                          <CefrBadge level={card.vocabularyItem.cefrLevel} />
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          {card.vocabularyItem.definition}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-700">{card.state}</td>
                      <td className="px-5 py-4 text-sm text-slate-700">{card.retentionTier}</td>
                      <td className="px-5 py-4 text-sm text-slate-700">{card.stability.toFixed(2)} d</td>
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {new Date(card.due).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={async () => {
                            await ReviewApi.resetCard(card.id)
                            if (userId) {
                              const deck = await ReviewApi.getDeck({ userId, page, size: 12 })
                              setCards(deck.content)
                            }
                          }}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Reset
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm text-slate-600">
              <span>{selectedUser ? `Deck de ${selectedUser.firstName}` : "Deck"}</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={page <= 0}
                  onClick={() => updateParam("page", String(Math.max(page - 1, 0)))}
                  className="rounded-xl border border-slate-300 px-3 py-2 disabled:opacity-50"
                >
                  Anterior
                </button>
                <span>Página {page + 1} de {totalPages}</span>
                <button
                  type="button"
                  disabled={page + 1 >= totalPages}
                  onClick={() => updateParam("page", String(page + 1))}
                  className="rounded-xl border border-slate-300 px-3 py-2 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}
