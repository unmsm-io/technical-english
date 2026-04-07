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
    getStudentMasteryRadar: mock(async () => ({
      userId: 7,
      kcs: [
        {
          kcId: 1,
          kcName: "passive_voice",
          kcNameEs: "Voz pasiva",
          category: "GRAMMAR" as const,
          pLearned: 0.96,
          totalResponses: 8,
          correctResponses: 7,
          masteredAt: "2026-04-07T02:00:00Z",
        },
      ],
      masteredCount: 1,
      totalKcs: 3,
      lastUpdate: "2026-04-07T04:00:00Z",
    })),
    getStabilityHeatmap: mock(async () => ({
      userId: 7,
      buckets: [
        { label: "0-3 días", count: 4 },
        { label: "4-7 días", count: 2 },
      ],
    })),
    getAcquisitionRate: mock(async () => ({
      userId: 7,
      points: [
        { week: "2026-W13", count: 3 },
        { week: "2026-W14", count: 5 },
      ],
    })),
    getFlowAlert: mock(async () => ({
      userId: 7,
      flowState: {
        state: "FLOW" as const,
        messageEs: "Buen equilibrio entre reto y dominio.",
        recommendation: "Mantener el ritmo actual.",
        computedAt: "2026-04-07T04:00:00Z",
        recent24hCorrectRate: 0.71,
        recent24hAttemptCount: 11,
        consecutiveAgains: 0,
        consecutiveEasys: 2,
      },
    })),
    recompute: mock(async () => undefined),
  },
}))

const { MasteryPage } = await import("./MasteryPage")

describe("MasteryPage", () => {
  it("renders student mastery widgets and kc table", async () => {
    const view = render(
      <MemoryRouter initialEntries={["/mastery?userId=7"]}>
        <Routes>
          <Route path="/mastery" element={<MasteryPage />} />
          <Route path="/mastery/kcs/:id" element={<div>detail</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(await view.findByText("Mi dominio")).toBeTruthy()
    expect(await view.findByText("Estudiante seleccionado")).toBeTruthy()
    expect(
      await view.findByText((content) => content.includes("ana@unmsm.edu.pe"))
    ).toBeTruthy()
    expect(await view.findByText("Buen equilibrio entre reto y dominio.")).toBeTruthy()
    expect((await view.findAllByText("Voz pasiva")).length).toBeGreaterThan(0)
    expect(await view.findByText("KCs dominados")).toBeTruthy()
  })
})
