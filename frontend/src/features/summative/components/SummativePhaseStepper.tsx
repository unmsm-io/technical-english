import type { SummativePhase } from "../../../types/summative"

const phases: Array<{ value: SummativePhase; label: string }> = [
  { value: "READING", label: "Lectura" },
  { value: "PRODUCTION", label: "Producción" },
  { value: "COMPREHENSION", label: "Comprensión" },
  { value: "COMPLETED", label: "Resultado" },
]

export function SummativePhaseStepper({ phase }: { phase: SummativePhase }) {
  const currentIndex = phases.findIndex((item) => item.value === phase)

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {phases.map((item, index) => {
        const active = index === currentIndex
        const complete = index < currentIndex

        return (
          <div
            key={item.value}
            className={`rounded-2xl border px-4 py-3 text-sm transition ${
              active
                ? "border-blue-300 bg-blue-50 text-blue-800"
                : complete
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-gray-200 bg-white text-gray-500"
            }`}
          >
            <div className="text-xs font-medium uppercase tracking-wide">
              Fase {index + 1}
            </div>
            <div className="mt-1 font-semibold">{item.label}</div>
          </div>
        )
      })}
    </div>
  )
}
