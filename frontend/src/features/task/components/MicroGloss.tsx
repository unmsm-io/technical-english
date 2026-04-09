import type { ReactNode } from "react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../../../components/ui/hover-card"

interface MicroGlossProps {
  children: ReactNode
  gloss: string
  term: string
}

export function MicroGloss({ children, gloss, term }: MicroGlossProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="cursor-help rounded-sm bg-muted px-1 text-foreground underline decoration-dotted underline-offset-4">
          {children}
        </span>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-72">
        <div className="space-y-1">
          <p className="text-sm font-semibold">{term}</p>
          <p className="text-sm leading-6 text-muted-foreground">{gloss}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
