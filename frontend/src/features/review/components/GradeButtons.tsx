import { useEffect } from "react"
import type { ReviewGrade } from "../../../types/review"

const buttons: Array<{
  grade: ReviewGrade
  label: string
  shortcut: string
  className: string
}> = [
  { grade: "AGAIN", label: "Again", shortcut: "1", className: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100" },
  { grade: "HARD", label: "Hard", shortcut: "2", className: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" },
  { grade: "GOOD", label: "Good", shortcut: "3", className: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
  { grade: "EASY", label: "Easy", shortcut: "4", className: "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100" },
]

interface GradeButtonsProps {
  disabled?: boolean
  canGrade: boolean
  onFlip: () => void
  onGrade: (grade: ReviewGrade) => void
}

export function GradeButtons({ disabled = false, canGrade, onFlip, onGrade }: GradeButtonsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (disabled) {
        return
      }

      if (event.code === "Space") {
        event.preventDefault()
        onFlip()
        return
      }

      const button = buttons.find((item) => item.shortcut === event.key)
      if (button && canGrade) {
        event.preventDefault()
        onGrade(button.grade)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [canGrade, disabled, onFlip, onGrade])

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {buttons.map((button) => (
        <button
          key={button.grade}
          type="button"
          disabled={disabled || !canGrade}
          onClick={() => onGrade(button.grade)}
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${button.className}`}
        >
          <span className="block">{button.label}</span>
          <span className="mt-1 block text-xs opacity-70">Tecla {button.shortcut}</span>
        </button>
      ))}
    </div>
  )
}
