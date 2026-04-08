import { afterEach, describe, expect, it, mock } from "bun:test"
import { render, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router"

const listGeneratedItems = mock(async () => ({
  content: [
    {
      id: 7,
      state: "PENDING_REVIEW" as const,
      targetCefrLevel: "B1" as const,
      targetSkill: "READING" as const,
      bloomLevel: "APPLY" as const,
      topicHint: "NullPointerException",
      questionText: "What does NullPointerException mean?",
      options: ["A", "B"],
      correctAnswerIdx: 0,
      explanation: "Explanation",
      solvabilityScore: 1,
      factualScore: 1,
      reasoningScore: 1,
      tokenPreservationOk: true,
      overallScore: 0.95,
      rejectionReason: null,
      promotedToDiagnosticItemId: null,
      createdAt: "2026-04-07T00:00:00",
    },
  ],
  totalElements: 1,
  totalPages: 1,
  size: 20,
  number: 0,
  first: true,
  last: true,
}))

const requestGeneration = mock(async () => ({}))

mock.module("../features/admin/AdminApi", () => ({
  AdminApi: {
    listGeneratedItems,
    requestGeneration,
  },
}))

mock.module("../api/users", () => ({
  getUsers: mock(async () => ({
    content: [
      {
        id: 1,
        codigo: "20200001",
        firstName: "Admin",
        lastName: "User",
        email: "admin@test.com",
        role: "ADMIN" as const,
        faculty: "FISI",
        englishLevel: "C1",
        targetSkills: [],
        vocabularySize: 5000,
        diagnosticCompleted: true,
        diagnosticCompletedAt: null,
        active: true,
        createdAt: "2026-04-07T00:00:00",
        updatedAt: "2026-04-07T00:00:00",
      },
    ],
  })),
  getUser: mock(async () => null),
}))

const { AdminGeneratedItemsPage } = await import("./AdminGeneratedItemsPage")

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/admin/generated-items"]}>
      <Routes>
        <Route
          path="/admin/generated-items"
          element={<AdminGeneratedItemsPage />}
        />
        <Route path="/admin/generated-items/:id" element={<div>detalle</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe("AdminGeneratedItemsPage", () => {
  afterEach(() => {
    listGeneratedItems.mockClear()
    requestGeneration.mockClear()
  })

  it("renders generated items and lets the user trigger generation", async () => {
    const view = renderPage()

    expect(await view.findByText("What does NullPointerException mean?")).toBeTruthy()
    await userEvent.click(view.getByRole("button", { name: "Generar item" }))

    await waitFor(() => {
      expect(requestGeneration).toHaveBeenCalled()
    })
  })
})
