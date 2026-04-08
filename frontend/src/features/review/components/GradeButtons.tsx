import { useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Kbd } from "../../../components/ui/kbd"
import { cn } from "../../../lib/utils"
import type { ReviewGrade } from "../../../types/review"

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
  canGrade: boolean
  disabled?: boolean
  onFlip: () => void
  onGrade: (grade: ReviewGrade) => void
}

export function GradeButtons({ canGrade, disabled = false, onFlip, onGrade }: GradeButtonsProps) {
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
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {buttons.map((button) => (
        <Button
          className={cn(
            "h-auto min-h-16 flex-col items-start rounded-xl px-4 py-3 text-left",
            !canGrade && "opacity-80"
          )}
          disabled={disabled || !canGrade}
          key={button.grade}
          onClick={() => onGrade(button.grade)}
          variant={button.variant}
        >
          <span className="text-sm font-medium">{button.label}</span>
          <span className="mt-1 flex items-center gap-1.5 text-xs opacity-80">
            <span>Tecla</span>
            <Kbd>{button.shortcut}</Kbd>
          </span>
        </Button>
      ))}
    </div>
  )
}
