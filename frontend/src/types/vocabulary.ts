import type { EnglishLevel, Page } from "./index"

export type VocabularyLayer = "GSL" | "AWL" | "EEWL" | "CSAWL"

export interface VocabularyItem {
  id: number
  term: string
  definition: string
  cefrLevel: EnglishLevel
  layer: VocabularyLayer
  frequency: number
  partOfSpeech: string
  exampleSentence: string
  protectedToken: boolean
  createdAt: string
  updatedAt: string
}

export interface VocabularyFilters {
  q?: string
  layer?: VocabularyLayer
  cefrLevel?: EnglishLevel
  page?: number
  size?: number
}

export type VocabularyPageResponse = Page<VocabularyItem>

export type TokenStatus = "PROTECTED" | "KNOWN" | "UNKNOWN"

export interface ProfileToken {
  value: string
  normalizedValue: string
  status: TokenStatus
}

export interface ProfileResult {
  totalTokens: number
  protectedTokens: string[]
  learnableTokens: string[]
  knownCount: number
  unknownTerms: string[]
  knownPercentage: number
  meetsThreshold: boolean
  tokens: ProfileToken[]
}
