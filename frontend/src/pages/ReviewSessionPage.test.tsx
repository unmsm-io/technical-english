import { afterEach, describe, expect, it, mock } from "bun:test"
import { render, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router"
import type { ReviewCard } from "../types/review"

const getUsers = mock(async () => ({
  content: [
    {
      id: 7,
      codigo: "20201234",
      firstName: "Ana",
      lastName: "Torres",
      email: "ana@example.com",
      role: "STUDENT" as const,
      faculty: "FISI",
      englishLevel: "B1",
      targetSkills: [],
      vocabularySize: 2000,
      diagnosticCompleted: true,
      diagnosticCompletedAt: "2026-04-07T00:00:00",
      active: true,
      createdAt: "2026-04-07T00:00:00",
      updatedAt: "2026-04-07T00:00:00",
    },
  ],
}))

const sampleCard: ReviewCard = {
  id: 21,
  vocabularyItem: {
    id: 22,
    term: "latency",
    definition: "Delay before a transfer begins.",
    cefrLevel: "B1",
    layer: "EEWL",
    frequency: 4,
    partOfSpeech: "noun",
    exampleSentence: "The optimization reduced latency.",
    protectedToken: false,
    createdAt: "2026-04-07T00:00:00",
    updatedAt: "2026-04-07T00:00:00",
  },
  stability: 0,
  difficulty: 0,
  elapsedDays: 0,
  scheduledDays: 0,
  reps: 0,
  lapses: 0,
  state: "NEW",
  lastReview: null,
  due: "2026-04-07T00:00:00Z",
  retentionTier: "TECHNICAL_CORE",
}

const getDue = mock(async () => [sampleCard])
const gradeCard = mock(async () => sampleCard)

mock.module("../api/users", () => ({
  getUsers,
  getUser: mock(async () => null),
}))

mock.module("../features/review/ReviewApi", () => ({
  ReviewApi: {
    getDue,
    gradeCard,
    gradeCardWithExample: mock(async () => ({
      card: sampleCard,
      feedback: {
        comment: "Good use.",
        correctedSentence: null,
        isCorrect: true,
      },
    })),
  },
}))

const { useReviewStore } = await import("../features/review/reviewStore")
const { ReviewSessionPage } = await import("./ReviewSessionPage")

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/review/session?userId=7"]}>
      <Routes>
        <Route path="/review/session" element={<ReviewSessionPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe("ReviewSessionPage", () => {
  afterEach(() => {
    useReviewStore.getState().reset()
    getUsers.mockClear()
    getDue.mockClear()
    gradeCard.mockClear()
  })

  it("loads session, flips card and grades the current card", async () => {
    const view = renderPage()

    expect(await view.findByText("latency")).toBeTruthy()

    await userEvent.click(view.getByText("latency"))
    await userEvent.click(view.getByRole("button", { name: /Good/i }))

    await waitFor(() => {
      expect(gradeCard).toHaveBeenCalledWith(21, "GOOD")
    })

    expect(await view.findByText("Sesión completa")).toBeTruthy()
  })
})
