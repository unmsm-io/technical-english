import { Download, FolderKanban } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router"
import { getUsers } from "../api/users"
import { PageShell } from "../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Button } from "../components/ui/button"
import { EmptyState } from "../components/ui/empty-state"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
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
    if (!portfolio || !timeline) return

    const markdown = [
      "# Portafolio de aprendizaje",
      "",
      `- Usuario: ${portfolio.userId}`,
      `- Tareas completadas: ${portfolio.tasksCompleted}`,
      `- Reescrituras aceptadas: ${Math.round(portfolio.rewriteAcceptanceRate * 100)}%`,
      `- Vocabulario técnico: ${portfolio.vocabularySize}`,
      `- KCs dominados: ${portfolio.kcMasteredCount}`,
      `- Pruebas finales aprobadas: ${portfolio.summativeTestsPassed}`,
      "",
      "## Highlights",
      ...portfolio.growthHighlights.map((item) => `- ${item.title}: ${item.afterText}`),
      "",
      "## Timeline",
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
    <PageShell
      actions={
        <>
          <div className="w-64">
            <Select
              onValueChange={(value) => setSearchParams(value === "none" ? {} : { userId: value })}
              value={selectedUserId ? String(selectedUserId) : "none"}
            >
              <SelectTrigger aria-label="Seleccionar estudiante">
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
          </div>
          <Button disabled={!portfolio || !timeline} onClick={exportMarkdown} variant="outline">
            <Download className="size-4" />
            Imprimir/exportar
          </Button>
        </>
      }
      subtitle="Evidencia auto-colectada de tareas, repaso, dominio técnico y pruebas finales."
      title="Portafolio"
    >
      {loading ? (
        <div className="text-sm text-muted-foreground">Cargando portafolio...</div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Error de carga</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : !portfolio || !timeline ? (
        <EmptyState
          action={
            <Button asChild>
              <Link to={selectedUserId ? `/diagnostic/start?userId=${selectedUserId}` : "/diagnostic/start"}>
                Ir al diagnóstico
              </Link>
            </Button>
          }
          description="Empieza con un diagnóstico o una tarea para construir el portafolio."
          icon={FolderKanban}
          title="Aún no hay actividad para este estudiante"
        />
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
    </PageShell>
  )
}
