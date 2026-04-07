import { create } from "zustand"
import { ReviewApi } from "./ReviewApi"
import type { ReviewCard, ReviewFeedbackPayload, ReviewGrade } from "../../types/review"

interface SessionStats {
  reviewed: number
  successful: number
  repeated: number
  startedAt: number | null
}

interface ReviewStoreState {
  selectedUserId: number | null
  queue: ReviewCard[]
  currentCard: ReviewCard | null
  isFlipped: boolean
  isLoading: boolean
  isGrading: boolean
  productionMode: boolean
  exampleSentence: string
  feedback: ReviewFeedbackPayload | null
  error: string | null
  sessionStats: SessionStats
  setSelectedUserId: (userId: number | null) => void
  setProductionMode: (enabled: boolean) => void
  setExampleSentence: (value: string) => void
  flip: () => void
  loadDue: (userId: number, limit?: number) => Promise<void>
  gradeCurrent: (grade: ReviewGrade) => Promise<void>
  reset: () => void
}

const initialStats = (): SessionStats => ({
  reviewed: 0,
  successful: 0,
  repeated: 0,
  startedAt: null,
})

export const useReviewStore = create<ReviewStoreState>((set, get) => ({
  selectedUserId: null,
  queue: [],
  currentCard: null,
  isFlipped: false,
  isLoading: false,
  isGrading: false,
  productionMode: false,
  exampleSentence: "",
  feedback: null,
  error: null,
  sessionStats: initialStats(),
  setSelectedUserId: (selectedUserId) => set({ selectedUserId }),
  setProductionMode: (productionMode) => set({ productionMode }),
  setExampleSentence: (exampleSentence) => set({ exampleSentence }),
  flip: () => set((state) => ({ isFlipped: !state.isFlipped })),
  loadDue: async (userId, limit = 20) => {
    set({
      selectedUserId: userId,
      isLoading: true,
      error: null,
      feedback: null,
      exampleSentence: "",
      productionMode: false,
    })

    try {
      const cards = await ReviewApi.getDue(userId, limit)
      set({
        queue: cards,
        currentCard: cards[0] ?? null,
        isFlipped: false,
        isLoading: false,
        sessionStats: {
          ...initialStats(),
          startedAt: Date.now(),
        },
      })
    } catch {
      set({
        queue: [],
        currentCard: null,
        isLoading: false,
        error: "No se pudo cargar la sesión de repaso.",
      })
    }
  },
  gradeCurrent: async (grade) => {
    const { currentCard, queue, productionMode, exampleSentence, sessionStats } = get()

    if (!currentCard) {
      set({ error: "No hay una tarjeta activa para calificar." })
      throw new Error("No active card")
    }

    set({ isGrading: true, error: null })

    try {
      const graded = productionMode && exampleSentence.trim()
        ? await ReviewApi.gradeCardWithExample(currentCard.id, grade, exampleSentence.trim())
        : await ReviewApi.gradeCard(currentCard.id, grade)

      const nextQueue = queue.slice(1)
      const nextCard = nextQueue[0] ?? null
      const feedback = "feedback" in graded ? graded.feedback : null

      set({
        queue: nextQueue,
        currentCard: nextCard,
        isFlipped: false,
        isGrading: false,
        exampleSentence: "",
        feedback,
        sessionStats: {
          ...sessionStats,
          reviewed: sessionStats.reviewed + 1,
          successful: sessionStats.successful + (grade === "AGAIN" ? 0 : 1),
          repeated: sessionStats.repeated + (grade === "AGAIN" ? 1 : 0),
        },
      })
    } catch {
      set({
        isGrading: false,
        error: "No se pudo registrar la calificación.",
      })
      throw new Error("Grade failed")
    }
  },
  reset: () =>
    set({
      selectedUserId: null,
      queue: [],
      currentCard: null,
      isFlipped: false,
      isLoading: false,
      isGrading: false,
      productionMode: false,
      exampleSentence: "",
      feedback: null,
      error: null,
      sessionStats: initialStats(),
    }),
}))
