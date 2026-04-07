import { describe, expect, it, mock } from "bun:test"
import { render } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import "../test/setup"

mock.module("../features/cohort/CohortApi", () => ({
  CohortApi: {
    getMastery: mock(async () => ({
      userCount: 18,
      distributions: [
        {
          kcId: 1,
          kcName: "passive_voice",
          kcNameEs: "Voz pasiva",
          lowCount: 2,
          mediumCount: 4,
          highCount: 5,
          masteredCount: 7,
        },
      ],
    })),
    getAcquisition: mock(async () => ({
      userCount: 18,
      points: [
        { week: "2026-W13", averageCount: 2.4, totalCount: 43 },
        { week: "2026-W14", averageCount: 3.1, totalCount: 56 },
      ],
    })),
  },
}))

const { AdminCohortAnalyticsPage } = await import("./AdminCohortAnalyticsPage")

describe("AdminCohortAnalyticsPage", () => {
  it("renders cohort metrics and charts", async () => {
    const view = render(
      <MemoryRouter>
        <AdminCohortAnalyticsPage />
      </MemoryRouter>
    )

    expect(await view.findByText("Cohort Analytics")).toBeTruthy()
    expect(await view.findByText("18")).toBeTruthy()
    expect(await view.findByText("Voz pasiva")).toBeTruthy()
    expect(await view.findByText("Adquisición agregada")).toBeTruthy()
  })
})
