import { afterEach, describe, expect, it, mock } from "bun:test"
import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router"

const listCohorts = mock(async () => [
  {
    id: 1,
    name: "Piloto Abril",
    description: "Seguimiento de cohorte.",
    state: "ENROLLING" as const,
    targetUserCount: 10,
    enrolledUserCount: 3,
    enrollmentStartedAt: "2026-04-08T00:00:00Z",
    interventionStartedAt: null,
    postTestStartedAt: null,
    completedAt: null,
    createdBy: 99,
  },
])

const createCohort = mock(async () => ({
  id: 2,
  name: "Piloto Mayo",
  description: "Nueva cohorte.",
  state: "ENROLLING" as const,
  targetUserCount: 12,
  enrolledUserCount: 0,
  enrollmentStartedAt: "2026-04-08T00:00:00Z",
  interventionStartedAt: null,
  postTestStartedAt: null,
  completedAt: null,
  createdBy: 99,
}))

const getUsers = mock(async () => ({
  content: [
    {
      id: 99,
      codigo: "20200001",
      firstName: "Ada",
      lastName: "Admin",
      email: "ada@example.com",
      role: "ADMIN" as const,
      faculty: "FISI",
      englishLevel: null,
      targetSkills: [],
      vocabularySize: null,
      diagnosticCompleted: false,
      diagnosticCompletedAt: null,
      active: true,
      createdAt: "2026-04-08T00:00:00Z",
      updatedAt: "2026-04-08T00:00:00Z",
    },
  ],
}))

mock.module("../features/pilot/PilotApi", () => ({
  PilotApi: {
    listCohorts,
    createCohort,
  },
}))

mock.module("../api/users", () => ({
  getUsers,
  getUser: mock(async () => null),
}))

const { AdminPilotPage } = await import("./AdminPilotPage")

describe("AdminPilotPage", () => {
  afterEach(() => {
    listCohorts.mockClear()
    createCohort.mockClear()
    getUsers.mockClear()
  })

  it("renders cohorts and creates a new one", async () => {
    const view = render(
      <MemoryRouter initialEntries={["/admin/pilot"]}>
        <Routes>
          <Route path="/admin/pilot" element={<AdminPilotPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await view.findByText("Pilot Studies")).toBeTruthy()
    expect(view.getByText("Piloto Abril")).toBeTruthy()

    await userEvent.type(view.getByPlaceholderText("Piloto Abril 2026"), "Piloto Mayo")
    await userEvent.type(
      view.getByPlaceholderText(
        "Seguimiento local de escritura técnica con pre-test, intervención y post-test."
      ),
      "Nueva cohorte."
    )
    await userEvent.click(view.getByRole("button", { name: "Crear cohorte" }))

    expect(createCohort).toHaveBeenCalled()
    expect(await view.findByText("Piloto Mayo")).toBeTruthy()
  })
})
