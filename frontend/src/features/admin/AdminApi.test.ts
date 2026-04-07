import { afterEach, describe, expect, it, mock } from "bun:test"
import { api } from "../../api/client"

const get = mock(async (url: string) => {
  if (url === "/verification/items/9") {
    return { data: { data: { id: 9 } } }
  }
  return { data: { data: { totalGenerated: 4 } } }
})

const post = mock(async (url: string, body?: unknown) => ({
  data: { data: { url, body } },
}))

api.get = get as typeof api.get
api.post = post as typeof api.post

describe("AdminApi", () => {
  afterEach(() => {
    get.mockClear()
    post.mockClear()
  })

  it("calls generation and approve endpoints with the expected payloads", async () => {
    const { AdminApi } = await import(`./AdminApi.ts?case=${Date.now()}`)

    await AdminApi.requestGeneration({
      requestedBy: 1,
      targetCefrLevel: "B1",
      targetSkill: "READING",
      bloomLevel: "APPLY",
      topicHint: "NullPointerException",
    })

    await AdminApi.approve(9, 2)
    await AdminApi.getGeneratedItem(9)

    expect(post).toHaveBeenCalledWith("/verification/generate", {
      requestedBy: 1,
      targetCefrLevel: "B1",
      targetSkill: "READING",
      bloomLevel: "APPLY",
      topicHint: "NullPointerException",
    })
    expect(post).toHaveBeenCalledWith("/verification/items/9/approve", {
      approvedBy: 2,
    })
    expect(get).toHaveBeenCalledWith("/verification/items/9")
  })
})
