import type { ReactNode } from "react"

interface CodeBlockProps {
  code: string
  language?: string
  children?: ReactNode
}

export function CodeBlock({ code, language, children }: CodeBlockProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 text-xs uppercase tracking-wide text-slate-400">
        <span>{language ?? "Texto técnico"}</span>
        {children}
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-sm leading-6 text-slate-100">
        <code className="font-mono whitespace-pre-wrap break-words">{code}</code>
      </pre>
    </div>
  )
}
