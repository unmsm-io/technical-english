interface ReviewProgressBarProps {
  reviewed: number
  remaining: number
}

export function ReviewProgressBar({ reviewed, remaining }: ReviewProgressBarProps) {
  const total = reviewed + remaining
  const progress = total === 0 ? 0 : Math.round((reviewed / total) * 100)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Progreso de la sesión</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
