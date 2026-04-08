import { afterEach, describe, expect, it, mock } from "bun:test"
import { api } from "../../api/client"

const get = mock(async (url: string, config?: unknown) => ({
  data: { data: { url, config } },
}))

const post = mock(async (url: string) => ({
  data: { data: { url } },
}))

api.get = get as typeof api.get
api.post = post as typeof api.post

describe("PortfolioApi", () => {
  afterEach(() => {
    get.mockClear()
    post.mockClear()
  })

  it("calls portfolio endpoints with the expected paths", async () => {
    const { PortfolioApi } = await import(`./PortfolioApi.ts?case=${Date.now()}`)

    await PortfolioApi.getCurrent(9)
    await PortfolioApi.getTimeline(9)
    await PortfolioApi.getHistory(9, 8)
    await PortfolioApi.recomputeAll()
    await PortfolioApi.recomputeOne(9)

    expect(get).toHaveBeenCalledWith("/portfolio/users/9")
    expect(get).toHaveBeenCalledWith("/portfolio/users/9/timeline")
    expect(get).toHaveBeenCalledWith("/portfolio/users/9/history", { params: { weeks: 8 } })
    expect(post).toHaveBeenCalledWith("/portfolio/recompute")
    expect(post).toHaveBeenCalledWith("/portfolio/users/9/recompute")
  })
})
