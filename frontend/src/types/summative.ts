import type { Page } from "./index"
import type { CefrLevel, TaskFeedbackPayload, TaskType } from "./task"

export type SummativePhase =
  | "READING"
  | "PRODUCTION"
  | "COMPREHENSION"
  | "COMPLETED"

export interface SummativeQuestion {
  question: string
  options: string[]
}

export interface SummativeQuestionReview extends SummativeQuestion {
  selectedAnswerIdx: number | null
  correctAnswerIdx: number | null
  correct: boolean
  explanation: string
}

export interface SummativeComprehensionResponseItem {
  questionIdx: number
  answerIdx: number | null
  correct: boolean
}

export interface SummativeTest {
  id: number
  taskType: TaskType
  cefrLevel: CefrLevel
  titleEs: string
  descriptionEs: string
  readingSpecEn: string
  readingContextEs: string
  productionInstructionEs: string
  comprehensionQuestionCount: number
}

export interface SummativeTestDetail extends SummativeTest {
  productionExpectedAnswerEn: string
  comprehensionQuestions: SummativeQuestionReview[]
  passingScore: number
  active: boolean
}

export interface SummativeAttempt {
  id: number
  testId: number
  userId: number
  currentPhase: SummativePhase
  productionAnswerEn: string | null
  productionScore: number | null
  productionFeedbackPayload: TaskFeedbackPayload | null
  comprehensionResponses: SummativeComprehensionResponseItem[]
  comprehensionScore: number | null
  overallScore: number | null
  passed: boolean | null
  startedAt: string
  submittedAt: string | null
  completedAt: string | null
}

export interface SummativeAttemptHistoryItem {
  id: number
  testId: number
  testTitleEs: string
  taskType: TaskType
  overallScore: number | null
  passed: boolean | null
  completedAt: string | null
}

export interface SummativeResult {
  attemptId: number
  testId: number
  titleEs: string
  taskType: TaskType
  productionScore: number
  productionAnswerEn: string
  productionFeedbackPayload: TaskFeedbackPayload | null
  comprehensionScore: number
  overallScore: number
  passed: boolean
  comprehensionReview: SummativeQuestionReview[]
  completedAt: string
}

export interface SummativeListFilters {
  type?: TaskType
  cefr?: CefrLevel
  q?: string
  page?: number
  size?: number
}

export type SummativeTestPage = Page<SummativeTest>
