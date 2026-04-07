import { afterEach, describe, expect, it, mock } from "bun:test"
import { render, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router"

const approve = mock(async () => ({}))
const reject = mock(async () => undefined)

mock.module("../features/admin/AdminApi", () => ({
  AdminApi: {
    getGeneratedItem: mock(async () => ({
      id: 5,
      requestedBy: 1,
      state: "PENDING_REVIEW" as const,
      targetCefrLevel: "B1" as const,
      targetSkill: "READING" as const,
      bloomLevel: "APPLY" as const,
      topicHint: "NullPointerException",
      questionText: "Question",
      options: ["A", "B"],
      correctAnswerIdx: 0,
      explanation: "Explanation",
      protectedTokens: ["NullPointerException"],
      solvabilityScore: 1,
      solvabilityNotes: "ok",
      factualScore: 1,
      factualNotes: "ok",
      reasoningScore: 1,
      reasoningNotes: "ok",
      tokenPreservationOk: true,
      tokenPreservationNotes: "ok",
      overallScore: 1,
      rejectionReason: null,
      approvedBy: null,
      approvedAt: null,
      promotedToDiagnosticItemId: null,
      verificationLogs: [],
      createdAt: "2026-04-07T00:00:00",
      updatedAt: "2026-04-07T00:00:00",
    })),
    approve,
    reject,
  },
}))

mock.module("../api/users", () => ({
  getUsers: mock(async () => ({
    content: [
      {
        id: 9,
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
}))

const { AdminGeneratedItemDetailPage } = await import("./AdminGeneratedItemDetailPage")

describe("AdminGeneratedItemDetailPage", () => {
  afterEach(() => {
    approve.mockClear()
    reject.mockClear()
  })

  it("approves and rejects from the detail page", async () => {
    const view = render(
      <MemoryRouter initialEntries={["/admin/generated-items/5"]}>
        <Routes>
          <Route
            path="/admin/generated-items/:id"
            element={<AdminGeneratedItemDetailPage />}
          />
          <Route path="/admin/generated-items" element={<div>lista</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(await view.findByText("Question")).toBeTruthy()
    await userEvent.click(view.getByRole("button", { name: "Aprobar" }))

    await waitFor(() => {
      expect(approve).toHaveBeenCalledWith(5, 9)
    })

    view.rerender(
      <MemoryRouter initialEntries={["/admin/generated-items/5"]}>
        <Routes>
          <Route
            path="/admin/generated-items/:id"
            element={<AdminGeneratedItemDetailPage />}
          />
          <Route path="/admin/generated-items" element={<div>lista</div>} />
        </Routes>
      </MemoryRouter>
    )
  })
})
