import { cn } from "../../../lib/utils"
import type { SummativePhase } from "../../../types/summative"

const phases: Array<{ label: string; value: SummativePhase }> = [
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
            className={cn(
              "rounded-lg border px-4 py-3",
              active && "border-foreground bg-accent",
              complete && "border-border bg-muted/40",
              !active && !complete && "border-border bg-card"
            )}
            key={item.value}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border text-sm font-semibold tabular-nums",
                  active && "border-foreground bg-foreground text-background",
                  complete && "border-border bg-muted text-foreground",
                  !active && !complete && "border-border text-muted-foreground"
                )}
              >
                {index + 1}
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Fase</p>
                <p className="text-sm font-medium">{item.label}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
