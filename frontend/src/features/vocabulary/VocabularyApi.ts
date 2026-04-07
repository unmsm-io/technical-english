import { api } from "../../api/client"
import type { ApiResponse } from "../../types"
import type {
  VocabularyFilters,
  VocabularyItem,
  VocabularyPageResponse,
} from "../../types/vocabulary"
import type { ProfileResult } from "../../types/vocabulary"

export async function getVocabulary(filters: VocabularyFilters = {}) {
  const { data } = await api.get<ApiResponse<VocabularyPageResponse>>(
    "/vocabulary",
    {
      params: filters,
    }
  )
  return data.data
}

export async function getVocabularyItem(id: number) {
  const { data } = await api.get<ApiResponse<VocabularyItem>>(`/vocabulary/${id}`)
  return data.data
}

export async function profileText(text: string) {
  const { data } = await api.post<ApiResponse<ProfileResult>>("/vocabulary/profile", {
    text,
  })
  return data.data
}
