import { afterEach, describe, expect, it, mock } from "bun:test"
import { api } from "../../api/client"

const get = mock(async (url: string) => {
  if (url === "/mastery/users/5/radar") {
    return {
      data: {
        data: { userId: 5, kcs: [], masteredCount: 1, totalKcs: 3, lastUpdate: null },
      },
    }
  }

  return { data: { data: { ok: true } } }
})

const post = mock(async (url: string) => ({
  data: { data: { url } },
}))

api.get = get as typeof api.get
api.post = post as typeof api.post

describe("MasteryApi", () => {
  afterEach(() => {
    get.mockClear()
    post.mockClear()
  })

  it("calls mastery and analytics endpoints with the expected paths", async () => {
    const { MasteryApi } = await import(`./MasteryApi.ts?case=${Date.now()}`)

    await MasteryApi.getRadar(5)
    await MasteryApi.getKcDetail(5, 9)
    await MasteryApi.getMasteredCount(5)
    await MasteryApi.recompute(5)
    await MasteryApi.getKnowledgeComponents({ q: "passive", page: 0, size: 10 })
    await MasteryApi.getStudentMasteryRadar(5)
    await MasteryApi.getStabilityHeatmap(5)
    await MasteryApi.getAcquisitionRate(5)
    await MasteryApi.getFlowAlert(5)

    expect(get).toHaveBeenCalledWith("/mastery/users/5/radar")
    expect(get).toHaveBeenCalledWith("/mastery/users/5/kcs/9")
    expect(get).toHaveBeenCalledWith("/mastery/users/5/mastered-count")
    expect(post).toHaveBeenCalledWith("/mastery/users/5/recompute")
    expect(get).toHaveBeenCalledWith("/kc", {
      params: { q: "passive", page: 0, size: 10 },
    })
    expect(get).toHaveBeenCalledWith("/analytics/users/5/mastery-radar")
    expect(get).toHaveBeenCalledWith("/analytics/users/5/stability-heatmap")
    expect(get).toHaveBeenCalledWith("/analytics/users/5/acquisition-rate")
    expect(get).toHaveBeenCalledWith("/analytics/users/5/flow-alert")
  })
})
