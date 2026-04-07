import { afterEach, describe, expect, it, mock } from "bun:test"
import type { TaskFeedback } from "../../types/task"

const submit = mock(async (): Promise<TaskFeedback> => ({
  attemptId: 10,
  taskId: 3,
  taskType: "ERROR_MESSAGE",
  score: 84,
  userAnswerEn: "The error happens because user is null.",
  expectedAnswerEn: "The error happens because user is null before notifyUser runs.",
  postTaskExplanationEs: "Explicación",
  llmFeedbackPayload: {
    correctness: 84,
    strengths: ["Clear cause and effect."],
    errors: [],
    improvedAnswer: "The error happens because user is null before notifyUser runs.",
    languageFocusComments: "Use because to connect cause and result.",
  },
  languageFocusComments: "Use because to connect cause and result.",
  improvedAnswer: "The error happens because user is null before notifyUser runs.",
}))

mock.module("./TaskApi", () => ({
  TaskApi: {
    submit,
  },
}))

const { useTaskStore } = await import("./taskStore")

describe("useTaskStore", () => {
  afterEach(() => {
    submit.mockClear()
    useTaskStore.getState().reset()
  })

  it("stores the active task state and submits the answer", async () => {
    useTaskStore.getState().startTask(
      {
        id: 3,
        taskType: "ERROR_MESSAGE",
        cefrLevel: "B1",
        titleEs: "Task",
        descriptionEs: "Description",
        preTaskContextEn: "Context",
        preTaskGlosses: [],
        vocabularyItems: [],
        duringTaskPromptEn: "Prompt",
        duringTaskInstructionEs: "Instruction",
        expectedAnswerEn: "Expected",
        postTaskLanguageFocus: "{}",
        postTaskExplanationEs: "Explanation",
      },
      {
        id: 10,
        taskId: 3,
        userId: 4,
        phase: "DURING_TASK",
        userAnswerEn: null,
        llmFeedbackPayload: null,
        llmFeedbackCefr: null,
        score: null,
        startedAt: "2026-04-07T00:00:00",
        submittedAt: null,
        completedAt: null,
      }
    )
    useTaskStore.getState().setUserAnswer("The error happens because user is null.")

    const feedback = await useTaskStore.getState().submit()

    expect(submit).toHaveBeenCalledWith(10, "The error happens because user is null.")
    expect(feedback.score).toBe(84)
    expect(useTaskStore.getState().currentPhase).toBe("POST_TASK")
    expect(useTaskStore.getState().feedback?.improvedAnswer).toContain("before notifyUser")
  })
})
