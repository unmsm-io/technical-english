import { api } from "../../api/client"
import type { ApiResponse } from "../../types"
import type {
  DiagnosticAttemptHistory,
  DiagnosticAttemptStartResponse,
  DiagnosticResult,
} from "../../types/diagnostic"

export async function startDiagnostic(userId: number) {
  const { data } = await api.post<ApiResponse<DiagnosticAttemptStartResponse>>(
    "/diagnostic/attempts",
    { userId }
  )
  return data.data
}

export async function submitDiagnostic(attemptId: number, responses: number[]) {
  const { data } = await api.post<ApiResponse<DiagnosticResult>>(
    `/diagnostic/attempts/${attemptId}/submit`,
    { responses }
  )
  return data.data
}

export async function getDiagnosticHistory(userId: number) {
  const { data } = await api.get<ApiResponse<DiagnosticAttemptHistory[]>>(
    "/diagnostic/attempts",
    {
      params: { userId },
    }
  )
  return data.data
}
