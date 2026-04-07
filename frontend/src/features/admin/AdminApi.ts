import { api } from "../../api/client"
import type { ApiResponse, Page } from "../../types"
import type {
  CalibratedItem,
  CalibrationRunResult,
  CalibrationStats,
  GeneratedItem,
  GeneratedItemDetail,
  GeneratedItemState,
  GenerationRequestPayload,
  UserAbility,
  VerificationMetrics,
} from "../../types/admin"

export const AdminApi = {
  async requestGeneration(request: GenerationRequestPayload) {
    const { data } = await api.post<ApiResponse<GeneratedItem>>(
      "/verification/generate",
      request
    )
    return data.data
  },

  async listGeneratedItems(params: {
    state?: GeneratedItemState
    page?: number
    size?: number
  }) {
    const { data } = await api.get<ApiResponse<Page<GeneratedItem>>>(
      "/verification/items",
      { params }
    )
    return data.data
  },

  async getGeneratedItem(id: number) {
    const { data } = await api.get<ApiResponse<GeneratedItemDetail>>(
      `/verification/items/${id}`
    )
    return data.data
  },

  async approve(id: number, approvedBy: number) {
    const { data } = await api.post<ApiResponse<GeneratedItem>>(
      `/verification/items/${id}/approve`,
      { approvedBy }
    )
    return data.data
  },

  async reject(id: number, reason: string) {
    await api.post(`/verification/items/${id}/reject`, { reason })
  },

  async getMetrics() {
    const { data } = await api.get<ApiResponse<VerificationMetrics>>(
      "/verification/metrics"
    )
    return data.data
  },

  async getCalibrationStats() {
    const { data } = await api.get<ApiResponse<CalibrationStats>>(
      "/calibration/stats"
    )
    return data.data
  },

  async getCalibratedItems() {
    const { data } = await api.get<ApiResponse<CalibratedItem[]>>(
      "/calibration/items"
    )
    return data.data
  },

  async runCalibration() {
    const { data } = await api.post<ApiResponse<CalibrationRunResult>>(
      "/calibration/run"
    )
    return data.data
  },

  async getUserAbility(userId: number) {
    const { data } = await api.get<ApiResponse<UserAbility>>(
      `/calibration/users/${userId}/ability`
    )
    return data.data
  },
}
