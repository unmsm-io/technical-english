import { api } from "../../api/client"
import type { ApiResponse } from "../../types"
import type {
  SummativeAttempt,
  SummativeAttemptHistoryItem,
  SummativeListFilters,
  SummativePhase,
  SummativeResult,
  SummativeTestDetail,
  SummativeTestPage,
} from "../../types/summative"

export const SummativeApi = {
  async list(filters: SummativeListFilters = {}) {
    const { data } = await api.get<ApiResponse<SummativeTestPage>>("/summative/tests", {
      params: filters,
    })
    return data.data
  },

  async getById(id: number) {
    const { data } = await api.get<ApiResponse<SummativeTestDetail>>(`/summative/tests/${id}/detail`)
    return data.data
  },

  async startAttempt(userId: number, testId: number) {
    const { data } = await api.post<ApiResponse<SummativeAttempt>>("/summative/attempts", null, {
      params: { userId, testId },
    })
    return data.data
  },

  async advancePhase(attemptId: number, phase: SummativePhase) {
    const { data } = await api.patch<ApiResponse<SummativeAttempt>>(
      `/summative/attempts/${attemptId}/phase`,
      { phase }
    )
    return data.data
  },

  async submitProduction(attemptId: number, answerEn: string) {
    const { data } = await api.post<ApiResponse<SummativeAttempt>>(
      `/summative/attempts/${attemptId}/production`,
      { answerEn }
    )
    return data.data
  },

  async submitComprehension(attemptId: number, answerIdxs: number[]) {
    const { data } = await api.post<ApiResponse<SummativeResult>>(
      `/summative/attempts/${attemptId}/comprehension`,
      { answerIdxs }
    )
    return data.data
  },

  async getHistory(userId: number) {
    const { data } = await api.get<ApiResponse<SummativeAttemptHistoryItem[]>>(
      "/summative/attempts",
      { params: { userId } }
    )
    return data.data
  },

  async getAttempt(attemptId: number) {
    const { data } = await api.get<ApiResponse<SummativeAttempt>>(`/summative/attempts/${attemptId}`)
    return data.data
  },
}
