import type { ReactNode } from "react"

interface CodeBlockProps {
  children?: ReactNode
  code: string
  language?: string
}

export function CodeBlock({ children, code, language }: CodeBlockProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-zinc-950 text-zinc-50 shadow-none">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 text-xs uppercase tracking-wide text-zinc-400">
        <span>{language ?? "Texto técnico"}</span>
        {children}
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-sm leading-6">
        <code className="whitespace-pre-wrap break-words">{code}</code>
      </pre>
    </div>
  )
}
