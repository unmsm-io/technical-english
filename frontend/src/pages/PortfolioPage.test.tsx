import { afterEach, describe, expect, it, mock } from "bun:test"
import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router"

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

const getCurrent = mock(async () => ({
  userId: 7,
  tasksCompleted: 6,
  tasksWithRewrite: 2,
  rewriteAcceptanceRate: 0.5,
  vocabularySize: 18,
  vocabularyGrowthLast30d: 4,
  kcMasteredCount: 3,
  summativeTestsPassed: 1,
  summativeAvgScore: 72.5,
  abilityTheta: 0.44,
  abilityComparisonToFirst: 0.2,
  growthHighlights: [
    {
      title: "Documentación de API",
      beforeText: "Antes",
      afterText: "Después",
      comparedAt: "2026-04-08T00:00:00Z",
      deltaCount: 2,
    },
  ],
  recentTasks: [],
  computedAt: "2026-04-08T00:00:00Z",
}))

const getTimeline = mock(async () => ({
  userId: 7,
  entries: [
    {
      type: "TASK" as const,
      date: "2026-04-08T00:00:00Z",
      title: "Task",
      score: 80,
      snippet: "Summary",
    },
  ],
}))

const getHistory = mock(async () => [
  {
    id: 1,
    userId: 7,
    snapshotType: "ON_DEMAND" as const,
    tasksCompleted: 6,
    tasksWithRewrite: 2,
    rewriteAcceptanceRate: 0.5,
    vocabularySize: 18,
    vocabularyGrowthLast30d: 4,
    kcMasteredCount: 3,
    summativeTestsPassed: 1,
    summativeAvgScore: 72.5,
    abilityTheta: 0.44,
    abilityComparisonToFirst: 0.2,
    computedAt: "2026-04-08T00:00:00Z",
  },
])

mock.module("../api/users", () => ({
  getUsers,
}))

mock.module("../features/portfolio/PortfolioApi", () => ({
  PortfolioApi: {
    getCurrent,
    getTimeline,
    getHistory,
  },
}))

const { PortfolioPage } = await import("./PortfolioPage")

describe("PortfolioPage", () => {
  afterEach(() => {
    getUsers.mockClear()
    getCurrent.mockClear()
    getTimeline.mockClear()
    getHistory.mockClear()
  })

  it("renders the student portfolio summary", async () => {
    const createObjectURL = mock(() => "blob:portfolio")
    const revokeObjectURL = mock(() => undefined)
    URL.createObjectURL = createObjectURL as typeof URL.createObjectURL
    URL.revokeObjectURL = revokeObjectURL as typeof URL.revokeObjectURL

    const view = render(
      <MemoryRouter initialEntries={["/portfolio?userId=7"]}>
        <Routes>
          <Route path="/portfolio" element={<PortfolioPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await view.findByText("Resumen del portafolio")).toBeTruthy()
    expect(view.getByText("Highlights de crecimiento")).toBeTruthy()
    expect(view.getByText("Tendencia de habilidad")).toBeTruthy()
    expect(getCurrent).toHaveBeenCalledWith(7)

    await userEvent.click(view.getByRole("button", { name: "Imprimir/exportar" }))
    expect(createObjectURL).toHaveBeenCalled()
  })
})
