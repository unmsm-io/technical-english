import { afterEach, describe, expect, it, mock } from "bun:test"
import { render, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router"
import type { VocabularyFilters, VocabularyPageResponse } from "../types/vocabulary"

const getVocabulary = mock(
  async (filters: VocabularyFilters = {}): Promise<VocabularyPageResponse> => {
    if (filters.page === 1) {
      return {
        content: [
          {
            id: 2,
            term: "queue",
            definition: "computer science term for ordered work items",
            cefrLevel: "B1",
            layer: "CSAWL",
            frequency: 900,
            partOfSpeech: "noun",
            exampleSentence: "The service writes the job to the queue.",
            protectedToken: false,
            createdAt: "2026-04-07T00:00:00",
            updatedAt: "2026-04-07T00:00:00",
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
          id: 1,
          term: "analysis",
          definition: "academic term for detailed study",
          cefrLevel: "B1",
          layer: "AWL",
          frequency: 1200,
          partOfSpeech: "noun",
          exampleSentence: "The analysis explains the output variance.",
          protectedToken: false,
          createdAt: "2026-04-07T00:00:00",
          updatedAt: "2026-04-07T00:00:00",
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

mock.module("../features/vocabulary/VocabularyApi", () => ({
  getVocabulary,
}))

const { VocabularyPage } = await import("./VocabularyPage")

function renderPage(initialEntry = "/vocabulary") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/vocabulary" element={<VocabularyPage />} />
        <Route path="/vocabulary/:id" element={<div>detail</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe("VocabularyPage", () => {
  afterEach(() => {
    getVocabulary.mockClear()
  })

  it("renders rows, applies debounced search, and paginates on the server", async () => {
    const view = renderPage()

    expect(await view.findByText("analysis")).toBeTruthy()
    expect(getVocabulary).toHaveBeenCalledWith({
      q: undefined,
      layer: undefined,
      cefrLevel: undefined,
      page: 0,
      size: 10,
    })

    await userEvent.type(
      view.getByPlaceholderText("Buscar termino o definicion"),
      "queue"
    )

    await waitFor(
      () => {
        expect(getVocabulary).toHaveBeenCalledWith({
          q: "queue",
          layer: undefined,
          cefrLevel: undefined,
          page: 0,
          size: 10,
        })
      },
      { timeout: 1500 }
    )

    await userEvent.click(view.getByRole("button", { name: "Siguiente" }))

    expect(await view.findByText("queue")).toBeTruthy()
    expect(getVocabulary).toHaveBeenCalledWith({
      q: "queue",
      layer: undefined,
      cefrLevel: undefined,
      page: 1,
      size: 10,
    })
  })
})
