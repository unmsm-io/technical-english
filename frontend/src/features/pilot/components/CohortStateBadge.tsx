import { Badge } from "../../../components/ui/badge"
import type { CohortState } from "../../../types/pilot"

const stateLabels: Record<CohortState, string> = {
  ENROLLING: "Inscripción",
  PRE_TEST_PHASE: "Pre-test",
  INTERVENTION_PHASE: "Intervención",
  POST_TEST_PHASE: "Post-test",
  RESULTS_AVAILABLE: "Resultados",
  ARCHIVED: "Archivado",
}

export function CohortStateBadge({ state }: { state: CohortState }) {
  return <Badge variant={state === "RESULTS_AVAILABLE" ? "secondary" : "outline"}>{stateLabels[state]}</Badge>
}
