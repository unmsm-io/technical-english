import { Badge } from "../../../components/ui/badge"

export function DifficultyBadge({ difficulty }: { difficulty: number | null }) {
  if (difficulty === null) {
    return <Badge variant="outline">Sin calibrar</Badge>
  }

  return <Badge variant="secondary">b={difficulty.toFixed(2)}</Badge>
}
