import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { MetricCard } from "../../../components/ui/metric-card"
import type { PortfolioResponse } from "../../../types/portfolio"

export function PortfolioSummaryCard({ portfolio }: { portfolio: PortfolioResponse }) {
  const metrics = [
    { label: "Tareas completadas", value: portfolio.tasksCompleted },
    { label: "Reescrituras", value: portfolio.tasksWithRewrite },
    { label: "Vocabulario técnico", value: portfolio.vocabularySize },
    { label: "KCs dominados", value: portfolio.kcMasteredCount },
    { label: "Pruebas aprobadas", value: portfolio.summativeTestsPassed },
    { label: "Promedio sumativo", value: Math.round(portfolio.summativeAvgScore) },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen del portafolio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Aceptación de rewrite</p>
          <p className="mt-1 text-2xl font-semibold">{Math.round(portfolio.rewriteAcceptanceRate * 100)}%</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
