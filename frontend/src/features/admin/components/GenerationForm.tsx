import { Loader2 } from "lucide-react"
import { useState, type FormEvent } from "react"
import type { User } from "../../../types"
import type { DiagnosticSkill } from "../../../types/diagnostic"
import type { BloomLevel, GenerationRequestPayload } from "../../../types/admin"

const cefrLevels: GenerationRequestPayload["targetCefrLevel"][] = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
]

const skills: DiagnosticSkill[] = ["READING", "VOCAB", "GRAMMAR"]
const bloomLevels: BloomLevel[] = [
  "REMEMBER",
  "UNDERSTAND",
  "APPLY",
  "ANALYZE",
  "EVALUATE",
  "CREATE",
]

export function GenerationForm({
  adminUser,
  onSubmit,
}: {
  adminUser: User | null
  onSubmit: (payload: GenerationRequestPayload) => Promise<void>
}) {
  const [targetCefrLevel, setTargetCefrLevel] =
    useState<GenerationRequestPayload["targetCefrLevel"]>("B1")
  const [targetSkill, setTargetSkill] =
    useState<GenerationRequestPayload["targetSkill"]>("READING")
  const [bloomLevel, setBloomLevel] = useState<BloomLevel>("APPLY")
  const [topicHint, setTopicHint] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!adminUser) {
      setError("No hay un usuario ADMIN disponible para solicitar la generación.")
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        requestedBy: adminUser.id,
        targetCefrLevel,
        targetSkill,
        bloomLevel,
        topicHint,
      })
      setTopicHint("")
    } catch {
      setError("No se pudo generar el item.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:grid-cols-5"
    >
      <select
        value={targetCefrLevel}
        onChange={(event) =>
          setTargetCefrLevel(
            event.target.value as GenerationRequestPayload["targetCefrLevel"]
          )
        }
        className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
      >
        {cefrLevels.map((level) => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </select>
      <select
        value={targetSkill}
        onChange={(event) =>
          setTargetSkill(event.target.value as GenerationRequestPayload["targetSkill"])
        }
        className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
      >
        {skills.map((skill) => (
          <option key={skill} value={skill}>
            {skill}
          </option>
        ))}
      </select>
      <select
        value={bloomLevel}
        onChange={(event) => setBloomLevel(event.target.value as BloomLevel)}
        className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
      >
        {bloomLevels.map((level) => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </select>
      <input
        value={topicHint}
        onChange={(event) => setTopicHint(event.target.value)}
        placeholder="Tema o token técnico"
        className="rounded-xl border border-gray-200 px-3 py-2 text-sm md:col-span-2"
      />
      <div className="md:col-span-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {error ? <p className="text-sm text-rose-600">{error}</p> : <div />}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Generar item
        </button>
      </div>
    </form>
  )
}
