import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { VerificationScoreBadge } from "./VerificationScoreBadge"

export function AgentScoreCard({
  notes,
  passed,
  score,
  title,
}: {
  notes: string | null
  passed: boolean
  score: number | null
  title: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">{passed ? "Aprobado" : "Observado"}</p>
        </div>
        <VerificationScoreBadge score={score} />
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">
          {notes && notes.trim().length > 0 ? notes : "Sin observaciones."}
        </p>
      </CardContent>
    </Card>
  )
}
