import type { Page } from "./index"
import type { VocabularyItem } from "./vocabulary"

export type TaskType =
  | "ERROR_MESSAGE"
  | "API_DOC"
  | "COMMIT_MSG"
  | "PR_DESC"
  | "CODE_REVIEW"
  | "TECH_REPORT"

export type TaskPhase = "PRE_TASK" | "DURING_TASK" | "POST_TASK" | "COMPLETED"

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2"

export interface Task {
  id: number
  taskType: TaskType
  cefrLevel: CefrLevel
  titleEs: string
  descriptionEs: string
}

export interface TaskGloss {
  term: string
  gloss: string
}

export interface TaskDetail extends Task {
  preTaskContextEn: string
  preTaskGlosses: TaskGloss[]
  vocabularyItems: VocabularyItem[]
  duringTaskPromptEn: string
  duringTaskInstructionEs: string
  expectedAnswerEn: string
  postTaskLanguageFocus: string
  postTaskExplanationEs: string
}

export interface TaskAttempt {
  id: number
  taskId: number
  userId: number
  phase: TaskPhase
  userAnswerEn: string | null
  llmFeedbackPayload?: TaskFeedbackPayload | null
  llmFeedbackCefr?: CefrLevel | null
  score: number | null
  startedAt: string
  submittedAt: string | null
  completedAt: string | null
}

export interface TaskFeedbackError {
  original: string
  fix: string
  rule: string
}

export interface TaskFeedbackPayload {
  correctness: number
  strengths: string[]
  errors: TaskFeedbackError[]
  improvedAnswer: string
  languageFocusComments: string
}

export interface TaskFeedback {
  attemptId: number
  taskId: number
  taskType: TaskType
  score: number
  userAnswerEn: string
  expectedAnswerEn: string
  postTaskExplanationEs: string
  llmFeedbackPayload: TaskFeedbackPayload
  languageFocusComments: string
  improvedAnswer: string
}

export interface TaskTypeMeta {
  name: TaskType
  displayNameEs: string
}

export interface TaskStats {
  byType: Record<string, number>
  byLevel: Record<string, number>
  totalTasks: number
  totalAttempts: number
}

export interface TaskListFilters {
  type?: TaskType
  cefr?: CefrLevel
  q?: string
  page?: number
  size?: number
}

export interface TaskAttemptHistoryItem {
  id: number
  taskId: number
  taskTitleEs: string
  taskType: TaskType
  score: number | null
  completedAt: string | null
}

export type TaskPageResponse = Page<Task>
