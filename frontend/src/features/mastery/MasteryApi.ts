import { api } from "../../api/client"
import type { ApiResponse, Page } from "../../types"
import type {
  AcquisitionRateResponse,
  FlowAlertResponse,
  KcMasteryDetailResponse,
  KnowledgeComponent,
  MasteryRadarResponse,
  StabilityHeatmapResponse,
} from "../../types/mastery"

export interface KnowledgeComponentFilters {
  q?: string
  category?: string
  cefrLevel?: string
  page?: number
  size?: number
}

export const MasteryApi = {
  async getRadar(userId: number) {
    const { data } = await api.get<ApiResponse<MasteryRadarResponse>>(
      `/mastery/users/${userId}/radar`
    )
    return data.data
  },

  async getKcDetail(userId: number, kcId: number) {
    const { data } = await api.get<ApiResponse<KcMasteryDetailResponse>>(
      `/mastery/users/${userId}/kcs/${kcId}`
    )
    return data.data
  },

  async getMasteredCount(userId: number) {
    const { data } = await api.get<ApiResponse<number>>(
      `/mastery/users/${userId}/mastered-count`
    )
    return data.data
  },

  async recompute(userId: number) {
    await api.post(`/mastery/users/${userId}/recompute`)
  },

  async getKnowledgeComponents(filters: KnowledgeComponentFilters = {}) {
    const { data } = await api.get<ApiResponse<Page<KnowledgeComponent>>>("/kc", {
      params: filters,
    })
    return data.data
  },

  async getStudentMasteryRadar(userId: number) {
    const { data } = await api.get<ApiResponse<MasteryRadarResponse>>(
      `/analytics/users/${userId}/mastery-radar`
    )
    return data.data
  },

  async getStabilityHeatmap(userId: number) {
    const { data } = await api.get<ApiResponse<StabilityHeatmapResponse>>(
      `/analytics/users/${userId}/stability-heatmap`
    )
    return data.data
  },

  async getAcquisitionRate(userId: number) {
    const { data } = await api.get<ApiResponse<AcquisitionRateResponse>>(
      `/analytics/users/${userId}/acquisition-rate`
    )
    return data.data
  },

  async getFlowAlert(userId: number) {
    const { data } = await api.get<ApiResponse<FlowAlertResponse>>(
      `/analytics/users/${userId}/flow-alert`
    )
    return data.data
  },
}
