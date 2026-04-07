import { api } from "../../api/client"
import type { ApiResponse } from "../../types"
import type {
  CohortAcquisitionResponse,
  CohortMasteryResponse,
} from "../../types/cohort"

export const CohortApi = {
  async getMastery() {
    const { data } = await api.get<ApiResponse<CohortMasteryResponse>>(
      "/analytics/cohort/mastery"
    )
    return data.data
  },

  async getAcquisition() {
    const { data } = await api.get<ApiResponse<CohortAcquisitionResponse>>(
      "/analytics/cohort/acquisition"
    )
    return data.data
  },
}
