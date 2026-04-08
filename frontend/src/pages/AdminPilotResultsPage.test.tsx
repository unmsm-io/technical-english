import { afterEach, describe, expect, it, mock } from "bun:test"
import { render } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router"

const getResults = mock(async () => ({
  cohortId: 1,
  cohortName: "Piloto Abril",
  enrolledCount: 8,
  completedCount: 6,
  metrics: {
    vocabularySizeDelta: 3.4,
    vocabularyCohenD: 1.2,
    comprehensionScoreDelta: 9.5,
    comprehensionCohenD: 0.8,
    rewriteAcceptanceRate: 65,
    avgTimeToFirstActionMinutes: 42,
    return7dRate: 70,
    summativePassRate: 75,
  },
  perUserBreakdown: [
    {
      userId: 7,
      vocabularySizeDelta: 4,
      comprehensionScoreDelta: 11,
      rewriteAcceptanceRate: 80,
      timeToFirstActionMinutes: 30,
      returnedWithin7Days: true,
      postSummativePassRate: 100,
    },
  ],
}))

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
      diagnosticCompletedAt: "2026-04-07T00:00:00Z",
      active: true,
      createdAt: "2026-04-07T00:00:00Z",
      updatedAt: "2026-04-07T00:00:00Z",
    },
  ],
}))

mock.module("../features/pilot/PilotApi", () => ({
  PilotApi: {
    getResults,
  },
}))

mock.module("../api/users", () => ({
  getUsers,
  getUser: mock(async () => null),
}))

const { AdminPilotResultsPage } = await import("./AdminPilotResultsPage")

describe("AdminPilotResultsPage", () => {
  afterEach(() => {
    getResults.mockClear()
    getUsers.mockClear()
  })

  it("renders the cohort results summary", async () => {
    const view = render(
      <MemoryRouter initialEntries={["/admin/pilot/cohorts/1/results"]}>
        <Routes>
          <Route path="/admin/pilot/cohorts/:id/results" element={<AdminPilotResultsPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await view.findByText("Piloto Abril")).toBeTruthy()
    expect(view.getByText("Tamaño de efecto")).toBeTruthy()
    expect(view.getByText("Ana Torres")).toBeTruthy()
  })
})
