import type { ProfileToken, TokenStatus } from "../../../types/vocabulary"
import { cn } from "../../../lib/utils"

const statusStyles: Record<TokenStatus, string> = {
  KNOWN: "border-border bg-secondary text-foreground",
  UNKNOWN: "border-border bg-background text-muted-foreground",
  PROTECTED: "border-border bg-muted font-mono text-foreground",
}

export function HighlightedText({ tokens }: { tokens: ProfileToken[] }) {
  if (tokens.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
        El texto analizado aparecera aqui con resaltado por tipo de token.
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2 rounded-lg border bg-card p-4">
      {tokens.map((token, index) => (
        <span
          key={`${token.value}-${index}`}
          className={cn("rounded-md border px-2 py-1 text-sm", statusStyles[token.status])}
        >
          {token.value}
        </span>
      ))}
    </div>
  )
}
