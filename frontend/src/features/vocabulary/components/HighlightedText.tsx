import type { ProfileToken, TokenStatus } from "../../../types/vocabulary"

const statusStyles: Record<TokenStatus, string> = {
  KNOWN: "bg-emerald-100 text-emerald-800",
  UNKNOWN: "bg-rose-100 text-rose-800",
  PROTECTED: "bg-slate-200 text-slate-800",
}

export function HighlightedText({ tokens }: { tokens: ProfileToken[] }) {
  if (tokens.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500">
        El texto analizado aparecera aqui con resaltado por tipo de token.
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-4">
      {tokens.map((token, index) => (
        <span
          key={`${token.value}-${index}`}
          className={`rounded-md px-2 py-1 text-sm font-medium ${statusStyles[token.status]}`}
        >
          {token.value}
        </span>
      ))}
    </div>
  )
}
