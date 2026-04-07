import { afterEach, describe, expect, it, mock } from "bun:test"
import { render, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router"
import { useDiagnosticStore } from "../features/diagnostic/diagnosticStore"

const submitDiagnostic = mock(async () => ({
  attemptId: 91,
  userId: 4,
  placedLevel: "B1" as const,
  correctCount: 2,
  totalItems: 2,
  perLevelBreakdown: { A1: 0, A2: 0, B1: 2, B2: 0, C1: 0 },
  perSkillBreakdown: { READING: 1, VOCAB: 1, GRAMMAR: 0 },
  vocabularySize: 2000,
  completedAt: "2026-04-07T00:00:00",
}))

mock.module("../features/diagnostic/DiagnosticApi", () => ({
  submitDiagnostic,
}))

const { DiagnosticTestPage } = await import("./DiagnosticTestPage")

function seedStore() {
  useDiagnosticStore.setState({
    selectedUserId: 4,
    attemptId: 91,
    items: [
      {
        id: 1,
        cefrLevel: "A2",
        skill: "READING",
        questionText: "Question one",
        options: ["Option A", "Option B"],
      },
      {
        id: 2,
        cefrLevel: "B1",
        skill: "VOCAB",
        questionText: "Question two",
        options: ["Option C", "Option D"],
      },
    ],
    responses: [null, null],
    result: null,
  })
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/diagnostic/test"]}>
      <Routes>
        <Route path="/diagnostic/test" element={<DiagnosticTestPage />} />
        <Route path="/diagnostic/result" element={<div>resultado</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe("DiagnosticTestPage", () => {
  afterEach(() => {
    submitDiagnostic.mockClear()
    useDiagnosticStore.getState().reset()
  })

  it("moves through questions and submits the collected answers", async () => {
    seedStore()
    const view = renderPage()

    expect(await view.findByText("Question one")).toBeTruthy()
    await userEvent.click(view.getByRole("button", { name: /Option B/i }))
    await userEvent.click(view.getByRole("button", { name: "Siguiente" }))

    expect(await view.findByText("Question two")).toBeTruthy()
    await userEvent.click(view.getByRole("button", { name: /Option C/i }))
    await userEvent.click(view.getByRole("button", { name: "Enviar diagnóstico" }))

    await waitFor(() => {
      expect(submitDiagnostic).toHaveBeenCalledWith(91, [1, 0])
    })

    expect(await view.findByText("resultado")).toBeTruthy()
  })
})
