import { cn } from "../../../lib/utils"

export function VerificationScoreBadge({
  score,
}: {
  score: number | null
}) {
  if (score === null) {
    return (
      <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
        Sin score
      </span>
    )
  }

  const percentage = Math.round(score * 100)
  const tone =
    percentage >= 80
      ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
      : percentage >= 60
        ? "bg-amber-100 text-amber-700 ring-amber-200"
        : "bg-rose-100 text-rose-700 ring-rose-200"

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
        tone
      )}
    >
      {percentage}%
    </span>
  )
}
