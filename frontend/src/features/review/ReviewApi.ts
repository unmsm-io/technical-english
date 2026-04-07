import { api } from "../../api/client"
import type { ApiResponse } from "../../types"
import type {
  ReviewBootstrapResponse,
  ReviewCard,
  ReviewCardWithFeedback,
  ReviewDeckFilters,
  ReviewDeckPageResponse,
  ReviewGrade,
  ReviewStats,
} from "../../types/review"

export const ReviewApi = {
  async getDue(userId: number, limit = 20) {
    const { data } = await api.get<ApiResponse<ReviewCard[]>>("/reviews/due", {
      params: { userId, limit },
    })
    return data.data
  },
  async gradeCard(cardId: number, grade: ReviewGrade) {
    const { data } = await api.post<ApiResponse<ReviewCard>>(`/reviews/${cardId}/grade`, {
      grade,
    })
    return data.data
  },
  async gradeCardWithExample(cardId: number, grade: ReviewGrade, exampleSentence: string) {
    const { data } = await api.post<ApiResponse<ReviewCardWithFeedback>>(
      `/reviews/${cardId}/grade-with-example`,
      {
        grade,
        exampleSentence,
      }
    )
    return data.data
  },
  async bootstrap(userId: number) {
    const { data } = await api.post<ApiResponse<ReviewBootstrapResponse>>("/reviews/bootstrap", null, {
      params: { userId },
    })
    return data.data
  },
  async getStats(userId: number) {
    const { data } = await api.get<ApiResponse<ReviewStats>>("/reviews/stats", {
      params: { userId },
    })
    return data.data
  },
  async getDeck(filters: ReviewDeckFilters) {
    const { data } = await api.get<ApiResponse<ReviewDeckPageResponse>>("/reviews/deck", {
      params: filters,
    })
    return data.data
  },
  async getCard(cardId: number) {
    const { data } = await api.get<ApiResponse<ReviewCard>>(`/reviews/${cardId}`)
    return data.data
  },
  async resetCard(cardId: number) {
    await api.post(`/reviews/${cardId}/reset`)
  },
}
