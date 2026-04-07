import type { ReactNode } from "react"

interface MicroGlossProps {
  term: string
  gloss: string
  children: ReactNode
}

export function MicroGloss({ term, gloss, children }: MicroGlossProps) {
  return (
    <span className="group relative inline-block">
      <span className="cursor-help rounded bg-blue-50 px-1 text-blue-900 underline decoration-dotted underline-offset-4">
        {children}
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-64 -translate-x-1/2 rounded-xl bg-slate-900 px-3 py-2 text-xs leading-relaxed text-white shadow-lg group-hover:block">
        <span className="block font-semibold">{term}</span>
        <span className="mt-1 block text-slate-200">{gloss}</span>
      </span>
    </span>
  )
}
