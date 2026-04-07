import { Link } from "react-router"
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
            <span className="font-medium text-slate-900">{entry.kcNameEs}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {entry.category}
            </span>
          </div>
          <p className="text-xs uppercase tracking-wide text-slate-500">{entry.kcName}</p>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="min-w-32">
          <div className="flex items-center justify-between text-sm text-slate-700">
            <span>P(L)</span>
            <span className="font-semibold">{Math.round(entry.pLearned * 100)}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full ${
                entry.pLearned >= 0.95
                  ? "bg-emerald-500"
                  : entry.pLearned >= 0.7
                    ? "bg-amber-500"
                    : "bg-rose-500"
              }`}
              style={{ width: `${Math.max(4, Math.round(entry.pLearned * 100))}%` }}
            />
          </div>
        </div>
      </td>
      <td className="px-5 py-4 text-sm text-slate-700">{entry.totalResponses}</td>
      <td className="px-5 py-4 text-sm text-slate-700">{accuracy}%</td>
      <td className="px-5 py-4 text-sm text-slate-700">
        {entry.masteredAt ? new Date(entry.masteredAt).toLocaleDateString() : "En progreso"}
      </td>
      <td className="px-5 py-4 text-right">
        <Link
          to={`/mastery/kcs/${entry.kcId}?userId=${userId}`}
          className="inline-flex rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Ver detalle
        </Link>
      </td>
    </tr>
  )
}
