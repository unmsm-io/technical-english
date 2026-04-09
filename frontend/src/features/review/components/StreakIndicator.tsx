import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"

interface StreakIndicatorProps {
  longestStreak: number
  retentionRate: number
}

export function StreakIndicator({ longestStreak, retentionRate }: StreakIndicatorProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Ritmo reciente</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
            {longestStreak} días
          </p>
          <p>Racha más larga registrada en sesiones de repaso.</p>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
          <p className="text-xs uppercase tracking-wide">Retención reciente</p>
          <p className="mt-1 text-lg font-semibold text-foreground tabular-nums">{retentionRate}%</p>
        </div>
      </CardContent>
    </Card>
  )
}
