import { Download } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router"
import { getUsers } from "../api/users"
import { PortfolioApi } from "../features/portfolio/PortfolioApi"
import { AbilityTrendChart } from "../features/portfolio/components/AbilityTrendChart"
import { GrowthHighlightsList } from "../features/portfolio/components/GrowthHighlightsList"
import { PortfolioSummaryCard } from "../features/portfolio/components/PortfolioSummaryCard"
import { PortfolioTimeline } from "../features/portfolio/components/PortfolioTimeline"
import { VocabularyGrowthChart } from "../features/portfolio/components/VocabularyGrowthChart"
import type { User } from "../types"
import type { PortfolioResponse, PortfolioSnapshot, PortfolioTimelineResponse } from "../types/portfolio"

export function PortfolioPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [users, setUsers] = useState<User[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null)
  const [timeline, setTimeline] = useState<PortfolioTimelineResponse | null>(null)
  const [history, setHistory] = useState<PortfolioSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const selectedUserId = useMemo(() => {
    const rawValue = searchParams.get("userId")
    return rawValue ? Number(rawValue) : null
  }, [searchParams])

  useEffect(() => {
    getUsers(0, 100)
      .then((page) => {
        setUsers(page.content)
        if (!selectedUserId && page.content.length > 0) {
          setSearchParams({ userId: String(page.content[0].id) }, { replace: true })
        }
      })
      .catch(() => setUsers([]))
  }, [selectedUserId, setSearchParams])

  useEffect(() => {
    if (!selectedUserId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    Promise.all([
      PortfolioApi.getCurrent(selectedUserId),
      PortfolioApi.getTimeline(selectedUserId),
      PortfolioApi.getHistory(selectedUserId, 12),
    ])
      .then(([portfolioData, timelineData, historyData]) => {
        setPortfolio(portfolioData)
        setTimeline(timelineData)
        setHistory(historyData)
      })
      .catch(() => setError("No se pudo cargar el portafolio del estudiante."))
      .finally(() => setLoading(false))
  }, [selectedUserId])

  const exportMarkdown = () => {
    if (!portfolio || !timeline) {
      return
    }

    const markdown = [
      `# Portafolio de aprendizaje`,
      ``,
      `- Usuario: ${portfolio.userId}`,
      `- Tareas completadas: ${portfolio.tasksCompleted}`,
      `- Rewrites aceptadas: ${Math.round(portfolio.rewriteAcceptanceRate * 100)}%`,
      `- Vocabulario técnico: ${portfolio.vocabularySize}`,
      `- KCs dominados: ${portfolio.kcMasteredCount}`,
      `- Pruebas finales aprobadas: ${portfolio.summativeTestsPassed}`,
      ``,
      `## Highlights`,
      ...portfolio.growthHighlights.map((item) => `- ${item.title}: ${item.afterText}`),
      ``,
      `## Timeline`,
      ...timeline.entries.map((entry) => `- ${entry.type}: ${entry.title} (${entry.score ?? "sin score"})`),
    ].join("\n")

    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `portfolio-${portfolio.userId}.md`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Portafolio</h1>
          <p className="mt-1 text-sm text-slate-600">
            Evidencia auto-colectada de tareas, repaso, dominio técnico y pruebas finales.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            aria-label="Seleccionar usuario del portafolio"
            value={selectedUserId ?? ""}
            onChange={(event) => setSearchParams({ userId: event.target.value })}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={exportMarkdown}
            disabled={!portfolio || !timeline}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <Download className="h-4 w-4" />
            Imprimir/exportar
          </button>
        </div>
      </section>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-3xl bg-slate-100" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-700">
          {error}
        </div>
      ) : !portfolio || !timeline ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
          <p className="text-sm font-medium text-slate-900">Aún no hay actividad para este estudiante.</p>
          <p className="mt-2 text-sm text-slate-600">
            Empieza con un diagnóstico o una tarea para construir el portafolio.
          </p>
          <Link
            to={selectedUserId ? `/diagnostic/start?userId=${selectedUserId}` : "/diagnostic/start"}
            className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Ir al diagnóstico
          </Link>
        </div>
      ) : (
        <>
          <PortfolioSummaryCard portfolio={portfolio} />
          <GrowthHighlightsList items={portfolio.growthHighlights} />
          <div className="grid gap-6 xl:grid-cols-2">
            <PortfolioTimeline entries={timeline.entries} />
            <AbilityTrendChart snapshots={history} />
          </div>
          <VocabularyGrowthChart snapshots={history} />
        </>
      )}
    </div>
  )
}
