import { api } from "../../api/client"
import type { ApiResponse } from "../../types"
import type {
  TaskAttempt,
  TaskAttemptHistoryItem,
  TaskDetail,
  TaskFeedback,
  TaskListFilters,
  TaskPageResponse,
  TaskPhase,
  TaskStats,
  TaskTypeMeta,
} from "../../types/task"

export const TaskApi = {
  async list(filters: TaskListFilters = {}) {
    const { data } = await api.get<ApiResponse<TaskPageResponse>>("/tasks", {
      params: filters,
    })
    return data.data
  },

  async getById(id: number) {
    const { data } = await api.get<ApiResponse<TaskDetail>>(`/tasks/${id}`)
    return data.data
  },

  async getTypes() {
    const { data } = await api.get<ApiResponse<TaskTypeMeta[]>>("/tasks/types")
    return data.data
  },

  async getStats() {
    const { data } = await api.get<ApiResponse<TaskStats>>("/tasks/stats")
    return data.data
  },

  async startAttempt(userId: number, taskId: number) {
    const { data } = await api.post<ApiResponse<TaskAttempt>>("/task-attempts", null, {
      params: { userId, taskId },
    })
    return data.data
  },

  async advancePhase(attemptId: number, phase: TaskPhase) {
    const { data } = await api.patch<ApiResponse<TaskAttempt>>(
      `/task-attempts/${attemptId}/phase`,
      { phase }
    )
    return data.data
  },

  async submit(attemptId: number, userAnswerEn: string) {
    const { data } = await api.post<ApiResponse<TaskFeedback>>(
      `/task-attempts/${attemptId}/submit`,
      { userAnswerEn }
    )
    return data.data
  },

  async complete(attemptId: number) {
    const { data } = await api.patch<ApiResponse<TaskAttempt>>(
      `/task-attempts/${attemptId}/complete`
    )
    return data.data
  },

  async getHistory(userId: number) {
    const { data } = await api.get<ApiResponse<TaskAttemptHistoryItem[]>>(
      "/task-attempts",
      { params: { userId } }
    )
    return data.data
  },

  async getAttempt(attemptId: number) {
    const { data } = await api.get<ApiResponse<TaskAttempt>>(
      `/task-attempts/${attemptId}`
    )
    return data.data
  },
}
