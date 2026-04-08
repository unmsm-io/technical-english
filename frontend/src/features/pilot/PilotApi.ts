import { api } from "../../api/client"
import type { ApiResponse } from "../../types"
import type {
  CohortState,
  CreateCohortRequest,
  PilotCohort,
  PilotEnrollment,
  PilotResultsResponse,
} from "../../types/pilot"

export const PilotApi = {
  async createCohort(request: CreateCohortRequest) {
    const { data } = await api.post<ApiResponse<PilotCohort>>("/pilot/cohorts", request)
    return data.data
  },

  async listCohorts() {
    const { data } = await api.get<ApiResponse<PilotCohort[]>>("/pilot/cohorts")
    return data.data
  },

  async getCohort(id: number) {
    const { data } = await api.get<ApiResponse<PilotCohort>>(`/pilot/cohorts/${id}`)
    return data.data
  },

  async enrollUser(cohortId: number, userId: number) {
    const { data } = await api.post<ApiResponse<PilotEnrollment>>(
      `/pilot/cohorts/${cohortId}/enroll`,
      null,
      { params: { userId } }
    )
    return data.data
  },

  async advancePhase(cohortId: number, state: CohortState) {
    const { data } = await api.patch<ApiResponse<PilotCohort>>(
      `/pilot/cohorts/${cohortId}/advance`,
      { state }
    )
    return data.data
  },

  async triggerPostTest(cohortId: number) {
    const { data } = await api.post<ApiResponse<PilotCohort>>(
      `/pilot/cohorts/${cohortId}/trigger-post-test`
    )
    return data.data
  },

  async getResults(cohortId: number) {
    const { data } = await api.get<ApiResponse<PilotResultsResponse>>(
      `/pilot/cohorts/${cohortId}/results`
    )
    return data.data
  },

  async getEnrollments(cohortId: number) {
    const { data } = await api.get<ApiResponse<PilotEnrollment[]>>(
      `/pilot/cohorts/${cohortId}/enrollments`
    )
    return data.data
  },
}
