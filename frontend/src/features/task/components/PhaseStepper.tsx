import { cn } from "../../../lib/utils"
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
    <div className="rounded-lg border bg-card p-4 shadow-none">
      <ol className="grid gap-3 sm:grid-cols-3">
        {steps.map((step, index) => {
          const active = index === currentIndex
          const completed = index < currentIndex

          return (
            <li
              className={cn(
                "rounded-lg border px-4 py-3 text-sm",
                active && "border-foreground bg-accent",
                completed && "border-border bg-muted/30",
                !active && !completed && "border-border bg-card"
              )}
              key={step.key}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border text-sm font-semibold tabular-nums",
                    active && "border-foreground bg-foreground text-background",
                    completed && "border-border bg-muted text-foreground",
                    !active && !completed && "border-border text-muted-foreground"
                  )}
                >
                  {index + 1}
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Paso</p>
                  <p className="font-medium">{step.label}</p>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
