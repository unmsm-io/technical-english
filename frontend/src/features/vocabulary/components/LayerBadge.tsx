import type { VocabularyLayer } from "../../../types/vocabulary"
import { Badge } from "../../../components/ui/badge"

export function LayerBadge({ layer }: { layer: VocabularyLayer }) {
  return <Badge variant="secondary">{layer}</Badge>
}
