import { api } from "./client"
import type { ApiResponse } from "../types"
import type { DashboardStats } from "../types/diagnostic"

export async function getDashboardStats() {
  const { data } = await api.get<ApiResponse<DashboardStats>>("/analytics/dashboard")
  return data.data
}
