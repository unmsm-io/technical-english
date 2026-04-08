import { describe, expect, it } from "bun:test"
import { render } from "@testing-library/react"
import "../../../test/setup"
import { FlowStateCard } from "./FlowStateCard"

describe("FlowStateCard", () => {
  it("renders the spanish message and recommendation", () => {
    const view = render(
      <FlowStateCard
        flowState={{
          state: "FLOW",
          messageEs: "El estudiante está en flow.",
          recommendation: "Mantener la dificultad actual.",
          computedAt: "2026-04-07T04:00:00Z",
          recent24hCorrectRate: 0.72,
          recent24hAttemptCount: 12,
          consecutiveAgains: 0,
          consecutiveEasys: 1,
        }}
      />
    )

    expect(view.getByText("Estado de flow")).toBeTruthy()
    expect(view.getByText("El estudiante está en flow.")).toBeTruthy()
    expect(view.getByText("Mantener la dificultad actual.")).toBeTruthy()
  })
})
