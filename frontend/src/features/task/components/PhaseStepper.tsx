import type { TaskPhase } from "../../../types/task"

const steps = [
  { key: "PRE_TASK" as const, label: "Preparación" },
  { key: "DURING_TASK" as const, label: "Tarea" },
  { key: "POST_TASK" as const, label: "Resultado" },
]

const phaseIndexes: Record<TaskPhase, number> = {
  PRE_TASK: 0,
  DURING_TASK: 1,
  POST_TASK: 2,
  COMPLETED: 2,
}

interface PhaseStepperProps {
  phase: TaskPhase
}

export function PhaseStepper({ phase }: PhaseStepperProps) {
  const currentIndex = phaseIndexes[phase]

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <ol className="grid gap-3 sm:grid-cols-3">
        {steps.map((step, index) => {
          const active = index === currentIndex
          const completed = index < currentIndex

          return (
            <li
              key={step.key}
              className={`rounded-xl border px-4 py-3 text-sm transition ${
                active
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : completed
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-gray-200 bg-gray-50 text-gray-500"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide">
                Paso {index + 1}
              </p>
              <p className="mt-1 font-medium">{step.label}</p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
