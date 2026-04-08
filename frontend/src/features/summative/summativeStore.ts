import { create } from "zustand"
import { SummativeApi } from "./SummativeApi"
import type {
  SummativeAttempt,
  SummativePhase,
  SummativeResult,
  SummativeTestDetail,
} from "../../types/summative"

interface SummativeState {
  currentTest: SummativeTestDetail | null
  currentAttempt: SummativeAttempt | null
  currentPhase: SummativePhase | null
  productionAnswer: string
  comprehensionAnswers: Record<number, number>
  result: SummativeResult | null
  isSubmitting: boolean
  error: string | null
  startSession: (test: SummativeTestDetail, attempt: SummativeAttempt) => void
  setPhase: (phase: SummativePhase) => void
  setProductionAnswer: (answer: string) => void
  setComprehensionAnswer: (questionIdx: number, answerIdx: number) => void
  submitProduction: () => Promise<SummativeAttempt>
  submitComprehension: () => Promise<SummativeResult>
  reset: () => void
}

function mapExistingAnswers(attempt: SummativeAttempt) {
  return attempt.comprehensionResponses.reduce<Record<number, number>>((accumulator, item) => {
    if (item.answerIdx !== null) {
      accumulator[item.questionIdx] = item.answerIdx
    }
    return accumulator
  }, {})
}

export const useSummativeStore = create<SummativeState>((set, get) => ({
  currentTest: null,
  currentAttempt: null,
  currentPhase: null,
  productionAnswer: "",
  comprehensionAnswers: {},
  result: null,
  isSubmitting: false,
  error: null,
  startSession: (currentTest, currentAttempt) =>
    set({
      currentTest,
      currentAttempt,
      currentPhase: currentAttempt.currentPhase,
      productionAnswer: currentAttempt.productionAnswerEn ?? "",
      comprehensionAnswers: mapExistingAnswers(currentAttempt),
      result: null,
      isSubmitting: false,
      error: null,
    }),
  setPhase: (currentPhase) => set({ currentPhase }),
  setProductionAnswer: (productionAnswer) => set({ productionAnswer }),
  setComprehensionAnswer: (questionIdx, answerIdx) =>
    set((state) => ({
      comprehensionAnswers: {
        ...state.comprehensionAnswers,
        [questionIdx]: answerIdx,
      },
    })),
  submitProduction: async () => {
    const { currentAttempt, productionAnswer } = get()

    if (!currentAttempt) {
      const error = "No hay un intento sumativo activo."
      set({ error })
      throw new Error(error)
    }

    set({ isSubmitting: true, error: null })

    try {
      const updatedAttempt = await SummativeApi.submitProduction(
        currentAttempt.id,
        productionAnswer.trim()
      )
      set({
        currentAttempt: updatedAttempt,
        currentPhase: updatedAttempt.currentPhase,
        productionAnswer: updatedAttempt.productionAnswerEn ?? productionAnswer.trim(),
        isSubmitting: false,
      })
      return updatedAttempt
    } catch {
      const error = "No se pudo evaluar la producción escrita."
      set({ error, isSubmitting: false })
      throw new Error(error)
    }
  },
  submitComprehension: async () => {
    const { currentAttempt, currentTest, comprehensionAnswers } = get()

    if (!currentAttempt || !currentTest) {
      const error = "No hay un intento sumativo listo para completar."
      set({ error })
      throw new Error(error)
    }

    const answerIdxs = currentTest.comprehensionQuestions.map((_, index) => {
      const value = comprehensionAnswers[index]
      return value ?? -1
    })

    set({ isSubmitting: true, error: null })

    try {
      const result = await SummativeApi.submitComprehension(currentAttempt.id, answerIdxs)
      set({
        result,
        currentPhase: "COMPLETED",
        currentAttempt: {
          ...currentAttempt,
          currentPhase: "COMPLETED",
          comprehensionResponses: result.comprehensionReview.map((item, questionIdx) => ({
            questionIdx,
            answerIdx: item.selectedAnswerIdx,
            correct: item.correct,
          })),
          comprehensionScore: result.comprehensionScore,
          overallScore: result.overallScore,
          passed: result.passed,
          completedAt: result.completedAt,
        },
        isSubmitting: false,
      })
      return result
    } catch {
      const error = "No se pudo registrar la comprensión final."
      set({ error, isSubmitting: false })
      throw new Error(error)
    }
  },
  reset: () =>
    set({
      currentTest: null,
      currentAttempt: null,
      currentPhase: null,
      productionAnswer: "",
      comprehensionAnswers: {},
      result: null,
      isSubmitting: false,
      error: null,
    }),
}))
