export interface GrowthHighlight {
  title: string
  beforeText: string
  afterText: string
  comparedAt: string
  deltaCount: number
}

export interface PortfolioTimelineEntry {
  type: "TASK" | "SUMMATIVE"
  date: string
  title: string
  score: number | null
  snippet: string
}

export interface PortfolioTimelineResponse {
  userId: number
  entries: PortfolioTimelineEntry[]
}

export interface PortfolioSnapshot {
  id: number
  userId: number
  snapshotType: "WEEKLY" | "ON_DEMAND"
  tasksCompleted: number
  tasksWithRewrite: number
  rewriteAcceptanceRate: number
  vocabularySize: number
  vocabularyGrowthLast30d: number
  kcMasteredCount: number
  summativeTestsPassed: number
  summativeAvgScore: number
  abilityTheta: number | null
  abilityComparisonToFirst: number
  computedAt: string
}

export interface PortfolioResponse {
  userId: number
  tasksCompleted: number
  tasksWithRewrite: number
  rewriteAcceptanceRate: number
  vocabularySize: number
  vocabularyGrowthLast30d: number
  kcMasteredCount: number
  summativeTestsPassed: number
  summativeAvgScore: number
  abilityTheta: number | null
  abilityComparisonToFirst: number
  growthHighlights: GrowthHighlight[]
  recentTasks: PortfolioTimelineEntry[]
  computedAt: string
}
