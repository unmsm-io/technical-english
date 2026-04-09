import { Badge } from "../../../components/ui/badge"

export function VerificationScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <Badge variant="outline">Sin score</Badge>
  }

  return <Badge variant={score >= 0.7 ? "secondary" : "outline"}>{Math.round(score * 100)}%</Badge>
}
