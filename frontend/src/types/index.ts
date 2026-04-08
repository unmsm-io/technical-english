export type UserRole = "STUDENT" | "TEACHER" | "ADMIN"
export type EnglishLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2"

export interface User {
  id: number
  codigo: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  faculty: string | null
  englishLevel: string | null
  targetSkills: string[]
  vocabularySize: number | null
  diagnosticCompleted: boolean
  diagnosticCompletedAt: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface CreateUserRequest {
  codigo: string
  firstName: string
  lastName: string
  email: string
  password: string
  role: UserRole
  faculty?: string
  englishLevel?: string
  targetSkills?: string[]
  vocabularySize?: number
  diagnosticCompleted?: boolean
  diagnosticCompletedAt?: string
}

export interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  email?: string
  role?: UserRole
  faculty?: string
  englishLevel?: string
  targetSkills?: string[]
  vocabularySize?: number
  diagnosticCompleted?: boolean
  diagnosticCompletedAt?: string
}

export * from "./task"
export * from "./review"
export * from "./mastery"
export * from "./cohort"
export * from "./summative"
export * from "./portfolio"
