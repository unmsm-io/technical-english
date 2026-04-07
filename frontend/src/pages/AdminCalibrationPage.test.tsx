import { describe, expect, it, mock } from "bun:test"
import { render } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import "../test/setup"

mock.module("../features/admin/AdminApi", () => ({
  AdminApi: {
    getCalibrationStats: mock(async () => ({
      totalItems: 15,
      byStatus: {
        UNCALIBRATED: 10,
        ESTIMATED: 3,
        CONVERGED: 2,
      },
      avgDifficulty: 0.2,
      avgDiscrimination: 1,
      avgAbilityTheta: 0.1,
      lastCalibrationAt: "2026-04-07T03:30:00Z",
      totalResponses: 120,
    })),
    getCalibratedItems: mock(async () => [
      {
        id: 1,
        questionPreview: "Question preview",
        cefrLevel: "B1" as const,
        difficulty: 0.42,
        discrimination: 1,
        responseCount: 32,
        status: "ESTIMATED" as const,
      },
    ]),
    runCalibration: mock(async () => ({
      itemsCalibrated: 5,
      itemsConverged: 2,
      durationMs: 1234,
      timestamp: "2026-04-07T03:30:00Z",
    })),
  },
}))

const { AdminCalibrationPage } = await import("./AdminCalibrationPage")

describe("AdminCalibrationPage", () => {
  it("renders calibration stats and items", async () => {
    const view = render(
      <MemoryRouter>
        <AdminCalibrationPage />
      </MemoryRouter>
    )

    expect(await view.findByText("Calibración IRT")).toBeTruthy()
    expect(await view.findByText("Question preview")).toBeTruthy()
    const estimatedLabels = await view.findAllByText("ESTIMATED")
    expect(estimatedLabels.length).toBeGreaterThan(0)
  })
})
