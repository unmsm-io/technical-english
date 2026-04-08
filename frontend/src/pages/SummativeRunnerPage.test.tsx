import { afterEach, describe, expect, it, mock } from "bun:test"
import { render, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router"

const getById = mock(async () => ({
  id: 6,
  taskType: "API_DOC" as const,
  cefrLevel: "B1" as const,
  titleEs: "Resumen de endpoint de usuarios",
  descriptionEs: "Lee la documentación y resume el propósito del endpoint.",
  readingSpecEn: "GET /v1/users/{id}",
  readingContextEs: "Lee el spec antes de responder.",
  productionInstructionEs: "Escribe dos frases en inglés.",
  productionExpectedAnswerEn: "The endpoint returns one user profile by id.",
  comprehensionQuestionCount: 1,
  comprehensionQuestions: [
    {
      question: "Which method is used?",
      options: ["POST", "GET", "DELETE"],
      selectedAnswerIdx: null,
      correctAnswerIdx: 1,
      correct: false,
      explanation: "The spec starts with GET.",
    },
  ],
  passingScore: 60,
  active: true,
}))

const startAttempt = mock(async () => ({
  id: 44,
  testId: 6,
  userId: 9,
  currentPhase: "READING" as const,
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
}))

const advancePhase = mock(async () => ({
  id: 44,
  testId: 6,
  userId: 9,
  currentPhase: "PRODUCTION" as const,
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
}))

const submitProduction = mock(async () => ({
  id: 44,
  testId: 6,
  userId: 9,
  currentPhase: "COMPREHENSION" as const,
  productionAnswerEn: "The endpoint returns one user profile by id.",
  productionScore: 92,
  productionFeedbackPayload: {
    correctness: 92,
    strengths: ["Clear summary."],
    errors: [],
    improvedAnswer: "The endpoint returns one user profile by id for dashboard rendering.",
    languageFocusComments: "Mention the consumer when relevant.",
  },
  comprehensionResponses: [],
  comprehensionScore: null,
  overallScore: null,
  passed: null,
  startedAt: "2026-04-08T00:00:00",
  submittedAt: "2026-04-08T00:05:00",
  completedAt: null,
}))

const submitComprehension = mock(async () => ({
  attemptId: 44,
  testId: 6,
  titleEs: "Resumen de endpoint de usuarios",
  taskType: "API_DOC" as const,
  productionScore: 92,
  productionAnswerEn: "The endpoint returns one user profile by id.",
  productionFeedbackPayload: {
    correctness: 92,
    strengths: ["Clear summary."],
    errors: [],
    improvedAnswer: "The endpoint returns one user profile by id for dashboard rendering.",
    languageFocusComments: "Mention the consumer when relevant.",
  },
  comprehensionScore: 100,
  overallScore: 95,
  passed: true,
  comprehensionReview: [
    {
      question: "Which method is used?",
      options: ["POST", "GET", "DELETE"],
      selectedAnswerIdx: 1,
      correctAnswerIdx: 1,
      correct: true,
      explanation: "The spec starts with GET.",
    },
  ],
  completedAt: "2026-04-08T00:08:00",
}))

mock.module("../features/summative/SummativeApi", () => ({
  SummativeApi: {
    getById,
    startAttempt,
    advancePhase,
    submitProduction,
    submitComprehension,
  },
}))

const { SummativeRunnerPage } = await import("./SummativeRunnerPage")

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/summative/6/run?userId=9"]}>
      <Routes>
        <Route path="/summative/:id/run" element={<SummativeRunnerPage />} />
        <Route path="/summative/:id/result/:attemptId" element={<div>resultado</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe("SummativeRunnerPage", () => {
  afterEach(() => {
    getById.mockClear()
    startAttempt.mockClear()
    advancePhase.mockClear()
    submitProduction.mockClear()
    submitComprehension.mockClear()
  })

  it("moves through reading, production and comprehension", async () => {
    const view = renderPage()

    expect(await view.findByText("Resumen de endpoint de usuarios")).toBeTruthy()
    await userEvent.click(view.getByRole("button", { name: "Continuar a producción" }))

    await waitFor(() => {
      expect(advancePhase).toHaveBeenCalledWith(44, "PRODUCTION")
    })

    await userEvent.type(
      view.getByPlaceholderText("Write your answer in English."),
      "The endpoint returns one user profile by id."
    )
    await userEvent.click(view.getByRole("button", { name: "Enviar producción" }))

    await waitFor(() => {
      expect(submitProduction).toHaveBeenCalledWith(
        44,
        "The endpoint returns one user profile by id."
      )
    })

    await userEvent.click(view.getAllByRole("radio")[1])
    await userEvent.click(view.getByRole("button", { name: "Enviar comprensión" }))

    await waitFor(() => {
      expect(submitComprehension).toHaveBeenCalledWith(44, [1])
    })
  })
})
