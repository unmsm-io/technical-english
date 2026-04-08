import type { CohortState } from "../../../types/pilot"

const stateLabels: Record<CohortState, string> = {
  ENROLLING: "Inscripción",
  PRE_TEST_PHASE: "Pre-test",
  INTERVENTION_PHASE: "Intervención",
  POST_TEST_PHASE: "Post-test",
  RESULTS_AVAILABLE: "Resultados",
  ARCHIVED: "Archivado",
}

const stateClasses: Record<CohortState, string> = {
  ENROLLING: "bg-sky-50 text-sky-700 ring-sky-200",
  PRE_TEST_PHASE: "bg-violet-50 text-violet-700 ring-violet-200",
  INTERVENTION_PHASE: "bg-amber-50 text-amber-700 ring-amber-200",
  POST_TEST_PHASE: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200",
  RESULTS_AVAILABLE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  ARCHIVED: "bg-slate-100 text-slate-600 ring-slate-200",
}

export function CohortStateBadge({ state }: { state: CohortState }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${stateClasses[state]}`}
    >
      {stateLabels[state]}
    </span>
  )
}
