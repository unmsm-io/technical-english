import type { EnglishLevel, Page } from "./index"
import type { VocabularyItem, VocabularyLayer } from "./vocabulary"

export type ReviewCardState = "NEW" | "LEARNING" | "REVIEW" | "RELEARNING"
export type ReviewGrade = "AGAIN" | "HARD" | "GOOD" | "EASY"
export type RetentionTier = "TECHNICAL_CORE" | "GENERAL"

export interface ReviewCard {
  id: number
  vocabularyItem: VocabularyItem
  stability: number
  difficulty: number
  elapsedDays: number
  scheduledDays: number
  reps: number
  lapses: number
  state: ReviewCardState
  lastReview: string | null
  due: string
  retentionTier: RetentionTier
}

export interface ReviewFeedbackPayload {
  comment: string
  correctedSentence: string | null
  isCorrect: boolean
}

export interface ReviewCardWithFeedback {
  card: ReviewCard
  feedback: ReviewFeedbackPayload
}

export interface ReviewBootstrapResponse {
  cardsCreated: number
  level: EnglishLevel
  durationMs: number
}

export interface ReviewWeeklyRetentionPoint {
  weekLabel: string
  retentionRate: number
}

export interface TopFailedReviewCard {
  cardId: number
  term: string
  lapses: number
  layer: VocabularyLayer
}

export interface ReviewStats {
  totalCards: number
  dueToday: number
  dueTomorrow: number
  dueThisWeek: number
  byState: Record<ReviewCardState, number>
  byTier: Record<RetentionTier, number>
  retentionRate: number
  avgStability: number
  longestStreak: number
  weeklyRetention: ReviewWeeklyRetentionPoint[]
  topFailedCards: TopFailedReviewCard[]
}

export interface ReviewDeckFilters {
  userId: number
  state?: ReviewCardState
  tier?: RetentionTier
  layer?: VocabularyLayer
  q?: string
  page?: number
  size?: number
}

export type ReviewDeckPageResponse = Page<ReviewCard>
