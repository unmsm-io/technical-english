import { cn } from "../../../lib/utils"

export function DifficultyBadge({ difficulty }: { difficulty: number | null }) {
  if (difficulty === null) {
    return (
      <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
        Sin calibrar
      </span>
    )
  }

  const tone =
    difficulty <= -0.5
      ? "bg-emerald-100 text-emerald-700"
      : difficulty >= 1
        ? "bg-rose-100 text-rose-700"
        : "bg-amber-100 text-amber-700"

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        tone
      )}
    >
      b={difficulty.toFixed(2)}
    </span>
  )
}
