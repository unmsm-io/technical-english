import { Progress } from "../../../components/ui/progress"

interface ReviewProgressBarProps {
  reviewed: number
  remaining: number
}

export function ReviewProgressBar({ reviewed, remaining }: ReviewProgressBarProps) {
  const total = reviewed + remaining
  const progress = total === 0 ? 0 : Math.round((reviewed / total) * 100)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Progreso de la sesión</span>
        <span className="tabular-nums">{progress}%</span>
      </div>
      <Progress value={progress} />
    </div>
  )
}
