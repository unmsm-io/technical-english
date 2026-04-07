export type KcCategory =
  | "GRAMMAR"
  | "VOCABULARY"
  | "READING"
  | "WRITING"
  | "LISTENING"
  | "SPEAKING"
  | "PRAGMATICS"
  | "STRATEGY"

export type KcItemType = "DIAGNOSTIC" | "TASK" | "VOCABULARY"

export type FlowZone = "FRUSTRATION" | "BOREDOM" | "FLOW" | "INACTIVE" | "NEUTRAL"

export interface KnowledgeComponent {
  id: number
  name: string
  nameEs: string
  description: string
  category: KcCategory
  cefrLevel: string
  pInitialLearned: number
  pTransition: number
  pGuess: number
  pSlip: number
  active: boolean
}

export interface KcMasteryEntry {
  kcId: number
  kcName: string
  kcNameEs: string
  category: KcCategory
  pLearned: number
  totalResponses: number
  correctResponses: number
  masteredAt: string | null
}

export interface MasteryRadarResponse {
  userId: number
  kcs: KcMasteryEntry[]
  masteredCount: number
  totalKcs: number
  lastUpdate: string | null
}

export interface KcMasteryStateSnapshot {
  userId: number
  pLearned: number
  consecutiveCorrect: number
  consecutiveIncorrect: number
  totalResponses: number
  correctResponses: number
  lastResponseAt: string | null
  masteredAt: string | null
}

export interface KcMasteryHistoryEntry {
  logId: number
  itemType: KcItemType
  itemId: number
  correct: boolean
  pLearnedBefore: number
  pLearnedAfter: number
  respondedAt: string
}

export interface KcRelatedItem {
  itemType: KcItemType
  itemId: number
  weight: number
}

export interface KcMasteryDetailResponse {
  knowledgeComponent: KnowledgeComponent
  state: KcMasteryStateSnapshot
  history: KcMasteryHistoryEntry[]
  relatedItems: KcRelatedItem[]
}

export interface StabilityBucket {
  label: string
  count: number
}

export interface StabilityHeatmapResponse {
  userId: number
  buckets: StabilityBucket[]
}

export interface AcquisitionPoint {
  week: string
  count: number
}

export interface AcquisitionRateResponse {
  userId: number
  points: AcquisitionPoint[]
}

export interface FlowState {
  state: FlowZone
  messageEs: string
  recommendation: string
  computedAt: string
  recent24hCorrectRate: number
  recent24hAttemptCount: number
  consecutiveAgains: number
  consecutiveEasys: number
}

export interface FlowAlertResponse {
  userId: number
  flowState: FlowState
}
