import { Flame } from "lucide-react"

interface StreakIndicatorProps {
  longestStreak: number
  retentionRate: number
}

export function StreakIndicator({ longestStreak, retentionRate }: StreakIndicatorProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-900">
      <div className="rounded-xl bg-orange-100 p-2">
        <Flame className="h-5 w-5" />
      </div>
      <div>
        <p className="font-semibold">Racha más larga: {longestStreak} días</p>
        <p className="text-orange-700">Retención reciente: {retentionRate}%</p>
      </div>
    </div>
  )
}
