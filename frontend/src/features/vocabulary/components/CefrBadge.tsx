import type { EnglishLevel } from "../../../types"

const levelStyles: Record<EnglishLevel, string> = {
  A1: "bg-green-100 text-green-700",
  A2: "bg-lime-100 text-lime-700",
  B1: "bg-cyan-100 text-cyan-700",
  B2: "bg-indigo-100 text-indigo-700",
  C1: "bg-fuchsia-100 text-fuchsia-700",
  C2: "bg-rose-100 text-rose-700",
}

export function CefrBadge({ level }: { level: EnglishLevel }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${levelStyles[level]}`}>
      {level}
    </span>
  )
}
