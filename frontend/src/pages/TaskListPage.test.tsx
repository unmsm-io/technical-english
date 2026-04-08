import { afterEach, describe, expect, it, mock } from "bun:test"
import { render, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router"
import type { TaskListFilters, TaskPageResponse } from "../types/task"

const list = mock(
  async (filters: TaskListFilters = {}): Promise<TaskPageResponse> => {
    if (filters.page === 1) {
      return {
        content: [
          {
            id: 9,
            taskType: "TECH_REPORT",
            cefrLevel: "B2",
            titleEs: "Reporte de benchmarks",
            descriptionEs: "Compara latencia y throughput.",
          },
        ],
        totalElements: 2,
        totalPages: 2,
        size: 10,
        number: 1,
        first: false,
        last: true,
      }
    }

    return {
      content: [
        {
          id: 5,
          taskType: "ERROR_MESSAGE",
          cefrLevel: "B1",
          titleEs: "Analiza un stack trace",
          descriptionEs: "Resume la causa raíz del incidente.",
        },
      ],
      totalElements: 2,
      totalPages: 2,
      size: 10,
      number: 0,
      first: true,
      last: false,
    }
  }
)

const getTypes = mock(async () => [
  { name: "ERROR_MESSAGE" as const, displayNameEs: "Mensaje de error" },
  { name: "TECH_REPORT" as const, displayNameEs: "Reporte técnico" },
])

mock.module("../features/task/TaskApi", () => ({
  TaskApi: {
    list,
    getTypes,
  },
}))

mock.module("../api/users", () => ({
  getUsers: mock(async () => ({
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
  })),
  getUser: mock(async () => ({
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
  })),
}))

const { TaskListPage } = await import("./TaskListPage")

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/tasks?userId=7"]}>
      <Routes>
        <Route path="/tasks" element={<TaskListPage />} />
        <Route path="/tasks/:id" element={<div>detail</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe("TaskListPage", () => {
  afterEach(() => {
    list.mockClear()
    getTypes.mockClear()
  })

  it("renders rows, applies filters, and paginates on the server", async () => {
    const view = renderPage()

    expect((await view.findAllByText("Analiza un stack trace")).length).toBeGreaterThan(0)
    expect(list).toHaveBeenCalledWith({
      type: undefined,
      cefr: undefined,
      q: undefined,
      page: 0,
      size: 10,
    })

    await userEvent.click(view.getByRole("combobox", { name: "Filtrar por tipo de tarea" }))
    await userEvent.click(await view.findByRole("option", { name: "Mensaje de error" }))

    await waitFor(() => {
      expect(list).toHaveBeenCalledWith({
        type: "ERROR_MESSAGE",
        cefr: undefined,
        q: undefined,
        page: 0,
        size: 10,
      })
    })

    await userEvent.click(view.getByRole("button", { name: "Mi nivel" }))

    await waitFor(() => {
      expect(list).toHaveBeenCalledWith({
        type: "ERROR_MESSAGE",
        cefr: "B1",
        q: undefined,
        page: 0,
        size: 10,
      })
    })

    await userEvent.click(view.getByRole("button", { name: "Siguiente" }))

    expect((await view.findAllByText("Reporte de benchmarks")).length).toBeGreaterThan(0)
    expect(list).toHaveBeenCalledWith({
      type: "ERROR_MESSAGE",
      cefr: "B1",
      q: undefined,
      page: 1,
      size: 10,
    })
  })
})
