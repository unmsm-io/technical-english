import { useEffect } from "react"
import type { ReviewGrade } from "../../../types/review"
import { Button } from "../../../components/ui/button"
import { Kbd } from "../../../components/ui/kbd"

const buttons: Array<{
  grade: ReviewGrade
  label: string
  shortcut: string
  variant: "default" | "destructive" | "outline" | "secondary"
}> = [
  { grade: "AGAIN", label: "Again", shortcut: "1", variant: "destructive" },
  { grade: "HARD", label: "Hard", shortcut: "2", variant: "secondary" },
  { grade: "GOOD", label: "Good", shortcut: "3", variant: "default" },
  { grade: "EASY", label: "Easy", shortcut: "4", variant: "outline" },
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
        <Button
          key={button.grade}
          disabled={disabled || !canGrade}
          onClick={() => onGrade(button.grade)}
          className="h-auto flex-col items-start rounded-lg px-4 py-3"
          variant={button.variant}
        >
          <span className="block">{button.label}</span>
          <span className="mt-1 flex items-center gap-1 text-xs opacity-80">
            <span>Tecla</span>
            <Kbd>{button.shortcut}</Kbd>
          </span>
        </Button>
      ))}
    </div>
  )
}
