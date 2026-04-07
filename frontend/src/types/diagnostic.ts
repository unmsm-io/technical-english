export type DiagnosticSkill = "READING" | "VOCAB" | "GRAMMAR"

export interface DiagnosticItem {
  id: number
  cefrLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
  skill: DiagnosticSkill
  questionText: string
  options: string[]
}

export interface DiagnosticAttemptStartResponse {
  attemptId: number
  userId: number
  startedAt: string
  items: DiagnosticItem[]
}

export interface DiagnosticResult {
  attemptId: number
  userId: number
  placedLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
  correctCount: number
  totalItems: number
  perLevelBreakdown: Record<string, number>
  perSkillBreakdown: Record<string, number>
  vocabularySize: number
  completedAt: string
}

export interface DiagnosticAttemptHistory {
  attemptId: number
  userId: number
  placedLevel: string | null
  correctCount: number
  startedAt: string
  completedAt: string | null
}

export interface DashboardStats {
  totalUsers: number
  diagnosticsCompleted: number
  averageVocabularySize: number
  vocabularyByLayer: Record<string, number>
}
