import { Loader2 } from "lucide-react"
import { useState, type FormEvent } from "react"
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"
import type { User } from "../../../types"
import type { DiagnosticSkill } from "../../../types/diagnostic"
import type { BloomLevel, GenerationRequestPayload } from "../../../types/admin"

const cefrLevels: GenerationRequestPayload["targetCefrLevel"][] = ["A1", "A2", "B1", "B2", "C1", "C2"]
const skills: DiagnosticSkill[] = ["READING", "VOCAB", "GRAMMAR"]
const bloomLevels: BloomLevel[] = ["REMEMBER", "UNDERSTAND", "APPLY", "ANALYZE", "EVALUATE", "CREATE"]

export function GenerationForm({
  adminUser,
  onSubmit,
}: {
  adminUser: User | null
  onSubmit: (payload: GenerationRequestPayload) => Promise<void>
}) {
  const [targetCefrLevel, setTargetCefrLevel] = useState<GenerationRequestPayload["targetCefrLevel"]>("B1")
  const [targetSkill, setTargetSkill] = useState<GenerationRequestPayload["targetSkill"]>("READING")
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
        bloomLevel,
        requestedBy: adminUser.id,
        targetCefrLevel,
        targetSkill,
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
    <Card>
      <CardHeader>
        <CardTitle>Solicitar generación</CardTitle>
        <CardDescription>Configura CEFR, skill, Bloom y un hint técnico opcional.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="grid gap-4 md:grid-cols-4" onSubmit={handleSubmit}>
          <Select onValueChange={(value) => setTargetCefrLevel(value as GenerationRequestPayload["targetCefrLevel"])} value={targetCefrLevel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cefrLevels.map((level) => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => setTargetSkill(value as GenerationRequestPayload["targetSkill"])} value={targetSkill}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {skills.map((skill) => (
                <SelectItem key={skill} value={skill}>{skill}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => setBloomLevel(value as BloomLevel)} value={bloomLevel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {bloomLevels.map((level) => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            onChange={(event) => setTopicHint(event.target.value)}
            placeholder="Tema o token técnico"
            value={topicHint}
          />
          <div className="md:col-span-4 flex justify-end">
            <Button disabled={submitting} type="submit">
              {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Generar item
            </Button>
          </div>
        </form>
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Error de generación</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  )
}
