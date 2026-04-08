import { api } from "../../api/client"
import type { ApiResponse } from "../../types"
import type {
  PortfolioResponse,
  PortfolioSnapshot,
  PortfolioTimelineResponse,
} from "../../types/portfolio"

export const PortfolioApi = {
  async getCurrent(userId: number) {
    const { data } = await api.get<ApiResponse<PortfolioResponse>>(`/portfolio/users/${userId}`)
    return data.data
  },

  async getTimeline(userId: number) {
    const { data } = await api.get<ApiResponse<PortfolioTimelineResponse>>(
      `/portfolio/users/${userId}/timeline`
    )
    return data.data
  },

  async getHistory(userId: number, weeks = 12) {
    const { data } = await api.get<ApiResponse<PortfolioSnapshot[]>>(
      `/portfolio/users/${userId}/history`,
      { params: { weeks } }
    )
    return data.data
  },

  async recomputeAll() {
    const { data } = await api.post<ApiResponse<PortfolioSnapshot[]>>("/portfolio/recompute")
    return data.data
  },

  async recomputeOne(userId: number) {
    const { data } = await api.post<ApiResponse<PortfolioResponse>>(
      `/portfolio/users/${userId}/recompute`
    )
    return data.data
  },
}
