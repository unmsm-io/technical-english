import { ArrowRight, BookOpenCheck } from "lucide-react"
import { Link, Navigate } from "react-router"
import { PageShell } from "../components/layout/page-shell"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { MetricCard } from "../components/ui/metric-card"
import { useDiagnosticStore } from "../features/diagnostic/diagnosticStore"
import { AbilityIndicator } from "../features/admin/components/AbilityIndicator"
import { CefrBadge } from "../features/vocabulary/components/CefrBadge"

export function DiagnosticResultPage() {
  const result = useDiagnosticStore((state) => state.result)
  const selectedUserId = useDiagnosticStore((state) => state.selectedUserId)

  if (!result) {
    return <Navigate to="/diagnostic/start" replace />
  }

  const maxBreakdownValue = Math.max(...Object.values(result.perLevelBreakdown), 1)

  return (
    <PageShell
      actions={
        <Button asChild>
          <Link to={`/vocabulary?cefrLevel=${result.placedLevel}`}>
            <BookOpenCheck className="size-4" />
            Ver vocabulario de este nivel
          </Link>
        </Button>
      }
      subtitle="Placement calculado según el mayor nivel con al menos 2 respuestas correctas sobre 3 ítems."
      title="Resultado del diagnóstico"
    >
      <Card>
        <CardHeader className="gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <CardDescription>Placement recomendado</CardDescription>
            <div className="inline-flex rounded-lg border bg-accent px-4 py-3">
              <CefrBadge level={result.placedLevel} />
            </div>
            <p className="text-sm text-muted-foreground">
              Respuestas correctas: {result.correctCount} de {result.totalItems}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard label="Tamaño vocabular estimado" value={result.vocabularySize} />
            <MetricCard
              label="Diagnóstico completado"
              value={new Date(result.completedAt).toLocaleDateString()}
            />
          </div>
        </CardHeader>
      </Card>

      <AbilityIndicator
        predictedCefr={result.predictedCefr}
        standardError={result.abilityStandardError}
        theta={result.abilityTheta}
      />

      <Card>
        <CardHeader>
          <CardTitle>Desglose por nivel</CardTitle>
          <CardDescription>Distribución de respuestas correctas a lo largo de la escala CEFR.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(result.perLevelBreakdown).map(([level, score]) => (
            <div className="space-y-2" key={level}>
              <div className="flex items-center justify-between text-sm">
                <span>{level}</span>
                <span className="text-muted-foreground">{score} correctas</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground"
                  style={{ width: `${(score / maxBreakdownValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {selectedUserId ? (
        <Button asChild variant="outline">
          <Link to={`/users/${selectedUserId}`}>
            Ir al perfil
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      ) : null}
    </PageShell>
  )
}
