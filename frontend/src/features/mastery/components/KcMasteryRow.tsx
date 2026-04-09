import { Link } from "react-router"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import type { KcMasteryEntry } from "../../../types/mastery"

interface KcMasteryRowProps {
  entry: KcMasteryEntry
  userId: number
}

export function KcMasteryRow({ entry, userId }: KcMasteryRowProps) {
  const accuracy =
    entry.totalResponses > 0
      ? Math.round((entry.correctResponses / entry.totalResponses) * 100)
      : 0

  return (
    <tr className="align-top">
      <td className="px-5 py-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{entry.kcNameEs}</span>
            <Badge variant="secondary">{entry.category}</Badge>
          </div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{entry.kcName}</p>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="min-w-32">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">P(L)</span>
            <span className="font-semibold tabular-nums">{Math.round(entry.pLearned * 100)}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground"
              style={{ width: `${Math.max(4, Math.round(entry.pLearned * 100))}%` }}
            />
          </div>
        </div>
      </td>
      <td className="px-5 py-4 text-sm tabular-nums">{entry.totalResponses}</td>
      <td className="px-5 py-4 text-sm tabular-nums">{accuracy}%</td>
      <td className="px-5 py-4 text-sm text-muted-foreground">
        {entry.masteredAt ? new Date(entry.masteredAt).toLocaleDateString() : "En progreso"}
      </td>
      <td className="px-5 py-4 text-right">
        <Button asChild size="sm" variant="outline">
          <Link to={`/mastery/kcs/${entry.kcId}?userId=${userId}`}>Ver detalle</Link>
        </Button>
      </td>
    </tr>
  )
}
