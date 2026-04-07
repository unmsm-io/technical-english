import { afterEach, describe, expect, it, mock } from "bun:test"
import { render, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router"
import { useTaskStore } from "../features/task/taskStore"

const advancePhase = mock(async () => ({
  id: 44,
  taskId: 12,
  userId: 3,
  phase: "DURING_TASK" as const,
  userAnswerEn: null,
  llmFeedbackPayload: null,
  llmFeedbackCefr: null,
  score: null,
  startedAt: "2026-04-07T00:00:00",
  submittedAt: null,
  completedAt: null,
}))

const submit = mock(async () => ({
  attemptId: 44,
  taskId: 12,
  taskType: "ERROR_MESSAGE" as const,
  score: 88,
  userAnswerEn: "The service passes a null user into notifyUser.",
  expectedAnswerEn: "The service passes a null user into notifyUser before calling getEmail().",
  postTaskExplanationEs: "Explicación",
  llmFeedbackPayload: {
    correctness: 88,
    strengths: ["Good technical explanation."],
    errors: [],
    improvedAnswer: "The service passes a null user into notifyUser before calling getEmail().",
    languageFocusComments: "Use before to mark sequence.",
  },
  languageFocusComments: "Use before to mark sequence.",
  improvedAnswer: "The service passes a null user into notifyUser before calling getEmail().",
}))

mock.module("../features/task/TaskApi", () => ({
  TaskApi: {
    advancePhase,
    submit,
    getById: mock(),
    getAttempt: mock(),
  },
}))

const { TaskRunnerPage } = await import("./TaskRunnerPage")

function seedStore() {
  useTaskStore.setState({
    currentTask: {
      id: 12,
      taskType: "ERROR_MESSAGE",
      cefrLevel: "B1",
      titleEs: "Stack trace",
      descriptionEs: "Describe la causa raíz.",
      preTaskContextEn: "The on-call engineer asks for help with a NullPointerException.",
      preTaskGlosses: [{ term: "NullPointerException", gloss: "error por objeto null" }],
      vocabularyItems: [],
      duringTaskPromptEn: "java.lang.NullPointerException: user is null",
      duringTaskInstructionEs: "Explica la causa raíz en inglés.",
      expectedAnswerEn: "Expected",
      postTaskLanguageFocus: "{}",
      postTaskExplanationEs: "Explicación",
    },
    currentAttempt: {
      id: 44,
      taskId: 12,
      userId: 3,
      phase: "PRE_TASK",
      userAnswerEn: null,
      llmFeedbackPayload: null,
      llmFeedbackCefr: null,
      score: null,
      startedAt: "2026-04-07T00:00:00",
      submittedAt: null,
      completedAt: null,
    },
    currentPhase: "PRE_TASK",
    userAnswer: "",
    feedback: null,
    isSubmitting: false,
    error: null,
  })
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/tasks/12/run?attemptId=44&userId=3"]}>
      <Routes>
        <Route path="/tasks/:id/run" element={<TaskRunnerPage />} />
        <Route path="/tasks/:id/result/:attemptId" element={<div>resultado</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe("TaskRunnerPage", () => {
  afterEach(() => {
    advancePhase.mockClear()
    submit.mockClear()
    useTaskStore.getState().reset()
  })

  it("advances phases and submits the answer", async () => {
    seedStore()
    const view = renderPage()

    expect(await view.findByRole("button", { name: "Listo, comenzar" })).toBeTruthy()
    await userEvent.click(view.getByRole("button", { name: "Listo, comenzar" }))

    await waitFor(() => {
      expect(advancePhase).toHaveBeenCalledWith(44, "DURING_TASK")
    })

    expect(await view.findByRole("heading", { name: "Tu respuesta" })).toBeTruthy()
    await userEvent.type(
      view.getByPlaceholderText("Write your answer in English..."),
      "The service passes a null user into notifyUser."
    )
    await userEvent.click(view.getByRole("button", { name: "Enviar respuesta" }))

    await waitFor(() => {
      expect(submit).toHaveBeenCalledWith(
        44,
        "The service passes a null user into notifyUser."
      )
    })

    expect(await view.findByText("resultado")).toBeTruthy()
  })
})
