import { afterEach, describe, expect, it, mock } from "bun:test"
import type { SummativeAttempt, SummativeResult, SummativeTestDetail } from "../../types/summative"

const submitProduction = mock(async (): Promise<SummativeAttempt> => ({
  id: 20,
  testId: 3,
  userId: 5,
  currentPhase: "COMPREHENSION",
  productionAnswerEn: "The endpoint returns the current deployment status.",
  productionScore: 88,
  productionFeedbackPayload: {
    correctness: 88,
    strengths: ["Clear and concise."],
    errors: [],
    improvedAnswer: "The endpoint returns the current deployment status for a given environment.",
    languageFocusComments: "Add the target environment for precision.",
  },
  comprehensionResponses: [],
  comprehensionScore: null,
  overallScore: null,
  passed: null,
  startedAt: "2026-04-08T00:00:00",
  submittedAt: "2026-04-08T00:05:00",
  completedAt: null,
}))

const submitComprehension = mock(async (): Promise<SummativeResult> => ({
  attemptId: 20,
  testId: 3,
  titleEs: "Resumen de documentación REST",
  taskType: "API_DOC",
  productionScore: 88,
  productionAnswerEn: "The endpoint returns the current deployment status.",
  productionFeedbackPayload: {
    correctness: 88,
    strengths: ["Clear and concise."],
    errors: [],
    improvedAnswer: "The endpoint returns the current deployment status for a given environment.",
    languageFocusComments: "Add the target environment for precision.",
  },
  comprehensionScore: 67,
  overallScore: 80,
  passed: true,
  comprehensionReview: [
    {
      question: "Which method is used?",
      options: ["POST", "GET", "PATCH"],
      selectedAnswerIdx: 1,
      correctAnswerIdx: 1,
      correct: true,
      explanation: "The spec states GET /deployments/{env}.",
    },
  ],
  completedAt: "2026-04-08T00:08:00",
}))

mock.module("./SummativeApi", () => ({
  SummativeApi: {
    submitProduction,
    submitComprehension,
  },
}))

const { useSummativeStore } = await import("./summativeStore")

const testDetail: SummativeTestDetail = {
  id: 3,
  taskType: "API_DOC",
  cefrLevel: "B1",
  titleEs: "Resumen de documentación REST",
  descriptionEs: "Lee una especificación y produce un resumen operativo.",
  readingSpecEn: "GET /deployments/{env}",
  readingContextEs: "Lee el spec y luego resume su propósito.",
  productionInstructionEs: "Escribe dos frases en inglés.",
  productionExpectedAnswerEn: "The endpoint returns the current deployment status for a given environment.",
  comprehensionQuestionCount: 1,
  comprehensionQuestions: [
    {
      question: "Which method is used?",
      options: ["POST", "GET", "PATCH"],
      selectedAnswerIdx: null,
      correctAnswerIdx: 1,
      correct: false,
      explanation: "The spec states GET /deployments/{env}.",
    },
  ],
  passingScore: 60,
  active: true,
}

const readingAttempt: SummativeAttempt = {
  id: 20,
  testId: 3,
  userId: 5,
  currentPhase: "PRODUCTION",
  productionAnswerEn: null,
  productionScore: null,
  productionFeedbackPayload: null,
  comprehensionResponses: [],
  comprehensionScore: null,
  overallScore: null,
  passed: null,
  startedAt: "2026-04-08T00:00:00",
  submittedAt: null,
  completedAt: null,
}

describe("useSummativeStore", () => {
  afterEach(() => {
    submitProduction.mockClear()
    submitComprehension.mockClear()
    useSummativeStore.getState().reset()
  })

  it("stores the active session and submits both phases", async () => {
    useSummativeStore.getState().startSession(testDetail, readingAttempt)
    useSummativeStore
      .getState()
      .setProductionAnswer("The endpoint returns the current deployment status.")

    const production = await useSummativeStore.getState().submitProduction()

    expect(submitProduction).toHaveBeenCalledWith(
      20,
      "The endpoint returns the current deployment status."
    )
    expect(production.currentPhase).toBe("COMPREHENSION")
    expect(useSummativeStore.getState().currentPhase).toBe("COMPREHENSION")

    useSummativeStore.getState().setComprehensionAnswer(0, 1)
    const result = await useSummativeStore.getState().submitComprehension()

    expect(submitComprehension).toHaveBeenCalledWith(20, [1])
    expect(result.overallScore).toBe(80)
    expect(useSummativeStore.getState().result?.passed).toBe(true)
    expect(useSummativeStore.getState().currentPhase).toBe("COMPLETED")
  })
})
