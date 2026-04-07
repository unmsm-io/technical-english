import { afterEach, describe, expect, it, mock } from "bun:test"
import type { ReviewCard, ReviewCardWithFeedback } from "../../types/review"

const sampleCard: ReviewCard = {
  id: 1,
  vocabularyItem: {
    id: 10,
    term: "throughput",
    definition: "Amount of work processed.",
    cefrLevel: "B1",
    layer: "EEWL",
    frequency: 10,
    partOfSpeech: "noun",
    exampleSentence: "The service increased throughput.",
    protectedToken: false,
    createdAt: "2026-04-07T00:00:00",
    updatedAt: "2026-04-07T00:00:00",
  },
  stability: 2.3,
  difficulty: 3.1,
  elapsedDays: 0,
  scheduledDays: 0,
  reps: 0,
  lapses: 0,
  state: "NEW",
  lastReview: null,
  due: "2026-04-07T00:00:00Z",
  retentionTier: "TECHNICAL_CORE",
}

const getDue = mock(async () => [sampleCard])
const gradeCard = mock(async () => sampleCard)
const gradeCardWithExample = mock(async (): Promise<ReviewCardWithFeedback> => ({
  card: sampleCard,
  feedback: {
    comment: "Good use of the term.",
    correctedSentence: null,
    isCorrect: true,
  },
}))

mock.module("./ReviewApi", () => ({
  ReviewApi: {
    getDue,
    gradeCard,
    gradeCardWithExample,
  },
}))

const { useReviewStore } = await import("./reviewStore")

describe("reviewStore", () => {
  afterEach(() => {
    useReviewStore.getState().reset()
    getDue.mockClear()
    gradeCard.mockClear()
    gradeCardWithExample.mockClear()
  })

  it("loads due cards and advances queue after a standard grade", async () => {
    await useReviewStore.getState().loadDue(7)

    expect(useReviewStore.getState().currentCard?.id).toBe(1)

    useReviewStore.getState().flip()
    await useReviewStore.getState().gradeCurrent("GOOD")

    expect(gradeCard).toHaveBeenCalledWith(1, "GOOD")
    expect(useReviewStore.getState().currentCard).toBeNull()
    expect(useReviewStore.getState().sessionStats.reviewed).toBe(1)
    expect(useReviewStore.getState().sessionStats.successful).toBe(1)
  })

  it("uses production mode endpoint and stores feedback", async () => {
    await useReviewStore.getState().loadDue(7)
    useReviewStore.getState().setProductionMode(true)
    useReviewStore.getState().setExampleSentence("The API improves throughput.")
    useReviewStore.getState().flip()

    await useReviewStore.getState().gradeCurrent("GOOD")

    expect(gradeCardWithExample).toHaveBeenCalledWith(
      1,
      "GOOD",
      "The API improves throughput."
    )
    expect(useReviewStore.getState().feedback?.comment).toContain("Good use")
  })
})
