import type { EnglishLevel } from "../../../types"
import { Badge } from "../../../components/ui/badge"

export function CefrBadge({ level }: { level: EnglishLevel }) {
  return <Badge variant="outline">{level}</Badge>
}
