import { describe, expect, it, mock } from "bun:test"
import { render } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router"
import "../test/setup"

mock.module("../api/users", () => ({
  getUser: mock(async () => null),
  getUsers: mock(async () => ({
    content: [
      {
        id: 7,
        codigo: "20260001",
        firstName: "Ana",
        lastName: "Torres",
        email: "ana@unmsm.edu.pe",
        role: "STUDENT" as const,
        faculty: "FISI",
        englishLevel: "B1",
        targetSkills: [],
        vocabularySize: 120,
        diagnosticCompleted: true,
        diagnosticCompletedAt: "2026-04-07T03:30:00Z",
        active: true,
        createdAt: "2026-04-07T00:00:00Z",
        updatedAt: "2026-04-07T00:00:00Z",
      },
    ],
    totalElements: 1,
    totalPages: 1,
    size: 10,
    number: 0,
    first: true,
    last: true,
  })),
}))

mock.module("../features/mastery/MasteryApi", () => ({
  MasteryApi: {
    getKcDetail: mock(async () => ({
      knowledgeComponent: {
        id: 1,
        name: "passive_voice",
        nameEs: "Voz pasiva",
        description: "Uso de estructuras pasivas en inglés técnico.",
        category: "GRAMMAR" as const,
        cefrLevel: "B1",
        pInitialLearned: 0.1,
        pTransition: 0.3,
        pGuess: 0.2,
        pSlip: 0.1,
        active: true,
      },
      state: {
        userId: 7,
        pLearned: 0.97,
        consecutiveCorrect: 4,
        consecutiveIncorrect: 0,
        totalResponses: 9,
        correctResponses: 8,
        lastResponseAt: "2026-04-07T03:00:00Z",
        masteredAt: "2026-04-07T02:30:00Z",
      },
      history: [
        {
          logId: 12,
          itemType: "TASK" as const,
          itemId: 21,
          correct: true,
          pLearnedBefore: 0.88,
          pLearnedAfter: 0.97,
          respondedAt: "2026-04-07T03:00:00Z",
        },
      ],
      relatedItems: [
        {
          itemType: "TASK" as const,
          itemId: 21,
          weight: 1,
        },
      ],
    })),
  },
}))

const { MasteryKcDetailPage } = await import("./MasteryKcDetailPage")

describe("MasteryKcDetailPage", () => {
  it("renders kc state, history and related items", async () => {
    const view = render(
      <MemoryRouter initialEntries={["/mastery/kcs/1?userId=7"]}>
        <Routes>
          <Route path="/mastery/kcs/:id" element={<MasteryKcDetailPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await view.findByText("Voz pasiva")).toBeTruthy()
    expect(await view.findByText("97%")).toBeTruthy()
    expect(await view.findByText("Ana Torres")).toBeTruthy()
    expect(await view.findByText("Item 21")).toBeTruthy()
    expect(await view.findByText("P(L) después: 97%")).toBeTruthy()
  })
})
