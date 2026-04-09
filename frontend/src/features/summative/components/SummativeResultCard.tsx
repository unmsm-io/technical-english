import { Badge } from "../../../components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { MetricCard } from "../../../components/ui/metric-card"
import type { SummativeResult } from "../../../types/summative"

export function SummativeResultCard({ result }: { result: SummativeResult }) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Desglose del resultado</CardTitle>
        <Badge variant={result.passed ? "secondary" : "outline"}>
          {result.passed ? "Aprobado" : "Aún no aprobado"}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Producción" value={`${result.productionScore}/100`} />
        <MetricCard label="Comprensión" value={`${result.comprehensionScore}/100`} />
        <MetricCard label="Resultado final" value={`${result.overallScore}/100`} />
      </CardContent>
    </Card>
  )
}
