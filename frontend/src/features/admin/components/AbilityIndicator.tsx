import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import type { CefrLevel } from "../../../types/task"

export function AbilityIndicator({
  predictedCefr,
  standardError,
  theta,
}: {
  predictedCefr: CefrLevel | null
  standardError: number | null
  theta: number | null
}) {
  if (theta === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Habilidad IRT</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Aún no hay theta estimado.</p>
        </CardContent>
      </Card>
    )
  }

  const barWidth = Math.max(8, Math.min(100, ((theta + 4) / 8) * 100))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base">Habilidad IRT</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {predictedCefr ? `CEFR predicho: ${predictedCefr}` : "Sin CEFR predicho"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tabular-nums">{theta.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">SE {standardError !== null ? standardError.toFixed(2) : "—"}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-foreground" style={{ width: `${barWidth}%` }} />
        </div>
      </CardContent>
    </Card>
  )
}
