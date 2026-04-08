export type CohortState =
  | "ENROLLING"
  | "PRE_TEST_PHASE"
  | "INTERVENTION_PHASE"
  | "POST_TEST_PHASE"
  | "RESULTS_AVAILABLE"
  | "ARCHIVED"

export interface CreateCohortRequest {
  name: string
  description: string
  targetUserCount: number
  createdBy: number
}

export interface PilotCohort {
  id: number
  name: string
  description: string
  state: CohortState
  targetUserCount: number
  enrolledUserCount: number
  enrollmentStartedAt: string | null
  interventionStartedAt: string | null
  postTestStartedAt: string | null
  completedAt: string | null
  createdBy: number
}

export interface PilotEnrollment {
  id: number
  cohortId: number
  userId: number
  enrolledAt: string
  preTestDiagnosticAttemptId: number
  preTestSummativeAttemptIds: number[]
  postTestDiagnosticAttemptId: number | null
  postTestSummativeAttemptIds: number[]
  firstActionAt: string | null
  lastActionAt: string | null
  actionsCount: number
}

export interface PilotMetricEntry {
  vocabularySizeDelta: number | null
  vocabularyCohenD: number | null
  comprehensionScoreDelta: number | null
  comprehensionCohenD: number | null
  rewriteAcceptanceRate: number | null
  avgTimeToFirstActionMinutes: number | null
  return7dRate: number | null
  summativePassRate: number | null
}

export interface PilotUserResult {
  userId: number
  vocabularySizeDelta: number | null
  comprehensionScoreDelta: number | null
  rewriteAcceptanceRate: number | null
  timeToFirstActionMinutes: number | null
  returnedWithin7Days: boolean
  postSummativePassRate: number | null
}

export interface PilotResultsResponse {
  cohortId: number
  cohortName: string
  enrolledCount: number
  completedCount: number
  metrics: PilotMetricEntry
  perUserBreakdown: PilotUserResult[]
}
