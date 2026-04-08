export interface CohortMasteryDistribution {
  kcId: number
  kcName: string
  kcNameEs: string
  lowCount: number
  mediumCount: number
  highCount: number
  masteredCount: number
}

export interface CohortMasteryResponse {
  userCount: number
  distributions: CohortMasteryDistribution[]
}

export interface CohortAcquisitionPoint {
  week: string
  averageCount: number
  totalCount: number
}

export interface CohortAcquisitionResponse {
  userCount: number
  points: CohortAcquisitionPoint[]
}
