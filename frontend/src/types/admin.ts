import type { CefrLevel } from "./task"
import type { DiagnosticSkill } from "./diagnostic"

export type GeneratedItemState =
  | "PENDING_GENERATION"
  | "GENERATING"
  | "VERIFYING"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "FAILED"

export type BloomLevel =
  | "REMEMBER"
  | "UNDERSTAND"
  | "APPLY"
  | "ANALYZE"
  | "EVALUATE"
  | "CREATE"

export type CalibrationStatus = "UNCALIBRATED" | "ESTIMATED" | "CONVERGED"

export interface GenerationRequestPayload {
  requestedBy: number
  targetCefrLevel: CefrLevel
  targetSkill: DiagnosticSkill
  bloomLevel: BloomLevel
  topicHint: string
}

export interface GeneratedItem {
  id: number
  state: GeneratedItemState
  targetCefrLevel: CefrLevel
  targetSkill: DiagnosticSkill
  bloomLevel: BloomLevel
  topicHint: string | null
  questionText: string | null
  options: string[]
  correctAnswerIdx: number | null
  explanation: string | null
  solvabilityScore: number | null
  factualScore: number | null
  reasoningScore: number | null
  tokenPreservationOk: boolean | null
  overallScore: number | null
  rejectionReason: string | null
  promotedToDiagnosticItemId: number | null
  createdAt: string
}

export interface VerificationLogEntry {
  id: number
  agentName: string
  latencyMs: number | null
  tokensUsed: number | null
  verdict: string | null
  rawResponseJson: string | null
  createdAt: string
}

export interface GeneratedItemDetail extends GeneratedItem {
  requestedBy: number
  protectedTokens: string[]
  solvabilityNotes: string | null
  factualNotes: string | null
  reasoningNotes: string | null
  tokenPreservationNotes: string | null
  approvedBy: number | null
  approvedAt: string | null
  verificationLogs: VerificationLogEntry[]
  updatedAt: string
}

export interface VerificationMetrics {
  totalGenerated: number
  approvedCount: number
  rejectedCount: number
  pendingCount: number
  approvalRate: number
  rejectionsByReason: Record<string, number>
  avgOverallScore: number | null
  last24hCount: number
}

export interface CalibrationStats {
  totalItems: number
  byStatus: Record<CalibrationStatus, number>
  avgDifficulty: number | null
  avgDiscrimination: number | null
  avgAbilityTheta: number | null
  lastCalibrationAt: string | null
  totalResponses: number
}

export interface CalibratedItem {
  id: number
  questionPreview: string
  cefrLevel: CefrLevel
  difficulty: number | null
  discrimination: number | null
  responseCount: number | null
  status: CalibrationStatus
}

export interface CalibrationRunResult {
  itemsCalibrated: number
  itemsConverged: number
  durationMs: number
  timestamp: string
}

export interface UserAbility {
  userId: number
  theta: number | null
  standardError: number | null
  lastUpdate: string | null
  predictedCefr: CefrLevel | null
  placedLevelLegacy: CefrLevel | null
}
