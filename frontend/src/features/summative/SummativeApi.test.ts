import { afterEach, describe, expect, it, mock } from "bun:test"
import { api } from "../../api/client"

const get = mock(async (url: string, config?: unknown) => ({
  data: { data: { url, config } },
}))

const post = mock(async (url: string, body?: unknown, config?: unknown) => ({
  data: { data: { url, body, config } },
}))

const patch = mock(async (url: string, body?: unknown) => ({
  data: { data: { url, body } },
}))

api.get = get as typeof api.get
api.post = post as typeof api.post
api.patch = patch as typeof api.patch

describe("SummativeApi", () => {
  afterEach(() => {
    get.mockClear()
    post.mockClear()
    patch.mockClear()
  })

  it("calls summative endpoints with the expected payloads", async () => {
    const { SummativeApi } = await import(`./SummativeApi.ts?case=${Date.now()}`)

    await SummativeApi.list({ type: "API_DOC", cefr: "B1", page: 0, size: 9 })
    await SummativeApi.getById(4)
    await SummativeApi.startAttempt(8, 4)
    await SummativeApi.advancePhase(12, "PRODUCTION")
    await SummativeApi.submitProduction(12, "A short answer")
    await SummativeApi.submitComprehension(12, [1, 0, 2])
    await SummativeApi.getHistory(8)
    await SummativeApi.getAttempt(12)

    expect(get).toHaveBeenCalledWith("/summative/tests", {
      params: { type: "API_DOC", cefr: "B1", page: 0, size: 9 },
    })
    expect(get).toHaveBeenCalledWith("/summative/tests/4/detail")
    expect(post).toHaveBeenCalledWith("/summative/attempts", null, {
      params: { userId: 8, testId: 4 },
    })
    expect(patch).toHaveBeenCalledWith("/summative/attempts/12/phase", {
      phase: "PRODUCTION",
    })
    expect(post).toHaveBeenCalledWith("/summative/attempts/12/production", {
      answerEn: "A short answer",
    })
    expect(post).toHaveBeenCalledWith("/summative/attempts/12/comprehension", {
      answerIdxs: [1, 0, 2],
    })
    expect(get).toHaveBeenCalledWith("/summative/attempts", {
      params: { userId: 8 },
    })
    expect(get).toHaveBeenCalledWith("/summative/attempts/12")
  })
})
