import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"

interface MasteryProgressRingProps {
  masteredCount: number
  totalKcs: number
}

export function MasteryProgressRing({ masteredCount, totalKcs }: MasteryProgressRingProps) {
  const ratio = totalKcs > 0 ? masteredCount / totalKcs : 0
  const radius = 58
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - ratio)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progreso de dominio</CardTitle>
        <CardDescription>Knowledge components por encima del threshold de mastery.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <div className="relative flex h-40 w-40 items-center justify-center">
          <svg aria-label="Progreso de dominio" className="h-40 w-40" role="img" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              fill="none"
              r={radius}
              stroke="var(--color-muted)"
              strokeWidth="14"
            />
            <circle
              cx="80"
              cy="80"
              fill="none"
              r={radius}
              stroke="var(--color-foreground)"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              strokeWidth="14"
              transform="rotate(-90 80 80)"
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-3xl font-semibold tabular-nums">{Math.round(ratio * 100)}%</p>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">mastery</p>
          </div>
        </div>

        <div className="grid w-full gap-3 sm:max-w-sm">
          <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">KCs dominados</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{masteredCount}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">KCs monitoreados</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{totalKcs}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Pendientes de consolidar</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{Math.max(totalKcs - masteredCount, 0)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
