import { describe, expect, it } from "bun:test"
import { render } from "@testing-library/react"
import "../../../test/setup"
import { MasteryRadarChart } from "./MasteryRadarChart"
import type { KcMasteryEntry } from "../../../types/mastery"

const entries: KcMasteryEntry[] = [
  {
    kcId: 1,
    kcName: "passive_voice",
    kcNameEs: "Voz pasiva",
    category: "GRAMMAR",
    pLearned: 0.91,
    totalResponses: 8,
    correctResponses: 7,
    masteredAt: null,
  },
  {
    kcId: 2,
    kcName: "api_documentation_reading",
    kcNameEs: "Lectura de documentación API",
    category: "READING",
    pLearned: 0.74,
    totalResponses: 6,
    correctResponses: 4,
    masteredAt: null,
  },
]

describe("MasteryRadarChart", () => {
  it("renders chart labels and percentages", () => {
    const view = render(<MasteryRadarChart entries={entries} />)

    expect(view.getByText("Radar de dominio")).toBeTruthy()
    expect(view.getAllByText("Voz pasiva").length).toBeGreaterThan(0)
    expect(view.getByText("91%")).toBeTruthy()
  })

  it("renders empty state when there are no entries", () => {
    const view = render(<MasteryRadarChart entries={[]} />)

    expect(
      view.getByText(
        "Aún no hay knowledge components con respuestas suficientes para construir el radar."
      )
    ).toBeTruthy()
  })
})
