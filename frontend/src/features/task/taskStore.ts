import { create } from "zustand"
import { TaskApi } from "./TaskApi"
import type {
  TaskAttempt,
  TaskDetail,
  TaskFeedback,
  TaskPhase,
} from "../../types/task"

interface TaskState {
  currentTask: TaskDetail | null
  currentAttempt: TaskAttempt | null
  currentPhase: TaskPhase | null
  userAnswer: string
  feedback: TaskFeedback | null
  isSubmitting: boolean
  error: string | null
  startTask: (task: TaskDetail, attempt: TaskAttempt) => void
  setPhase: (phase: TaskPhase) => void
  setUserAnswer: (userAnswer: string) => void
  submit: () => Promise<TaskFeedback>
  reset: () => void
}

export const useTaskStore = create<TaskState>((set, get) => ({
  currentTask: null,
  currentAttempt: null,
  currentPhase: null,
  userAnswer: "",
  feedback: null,
  isSubmitting: false,
  error: null,
  startTask: (currentTask, currentAttempt) =>
    set({
      currentTask,
      currentAttempt,
      currentPhase: currentAttempt.phase,
      userAnswer: currentAttempt.userAnswerEn ?? "",
      feedback: null,
      isSubmitting: false,
      error: null,
    }),
  setPhase: (currentPhase) => set({ currentPhase }),
  setUserAnswer: (userAnswer) => set({ userAnswer }),
  submit: async () => {
    const { currentAttempt, userAnswer } = get()

    if (!currentAttempt) {
      const error = "No hay un intento activo para enviar."
      set({ error })
      throw new Error(error)
    }

    set({ isSubmitting: true, error: null, currentPhase: "POST_TASK" })

    try {
      const feedback = await TaskApi.submit(currentAttempt.id, userAnswer.trim())
      set({
        feedback,
        currentPhase: "POST_TASK",
        currentAttempt: {
          ...currentAttempt,
          phase: "POST_TASK",
          userAnswerEn: feedback.userAnswerEn,
          score: feedback.score,
        },
        isSubmitting: false,
      })
      return feedback
    } catch {
      const error = "No se pudo generar el feedback de la tarea."
      set({
        error,
        currentPhase: currentAttempt.phase,
        isSubmitting: false,
      })
      throw new Error(error)
    }
  },
  reset: () =>
    set({
      currentTask: null,
      currentAttempt: null,
      currentPhase: null,
      userAnswer: "",
      feedback: null,
      isSubmitting: false,
      error: null,
    }),
}))
