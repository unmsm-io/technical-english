import { CodeBlock } from "../../task/components/CodeBlock"

interface SpecReaderProps {
  title: string
  instructionEs: string
  specEn: string
}

export function SpecReader({ title, instructionEs, specEn }: SpecReaderProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm leading-6 text-gray-600">{instructionEs}</p>
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200">
        <CodeBlock code={specEn} language="Technical input" />
      </div>
    </section>
  )
}
