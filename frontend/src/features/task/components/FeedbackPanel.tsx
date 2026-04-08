import { CheckCircle2, CircleAlert } from "lucide-react"
import { Badge } from "../../../components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { MetricCard } from "../../../components/ui/metric-card"
import type { TaskFeedback } from "../../../types/task"

interface FeedbackPanelProps {
  feedback: TaskFeedback
}

export function FeedbackPanel({ feedback }: FeedbackPanelProps) {
  const payload = feedback.llmFeedbackPayload

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Feedback de la tarea</p>
            <CardTitle>Puntaje y revisión</CardTitle>
          </div>
          <Badge variant="secondary">{feedback.score}/100</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <MetricCard label="Correctness" value={`${payload.correctness}/100`} />
          <MetricCard label="Sugerencias" value={payload.errors.length} />
        </div>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Fortalezas
          </h3>
          <div className="space-y-2">
            {payload.strengths.map((strength) => (
              <div
                className="flex gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm"
                key={strength}
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <p>{strength}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Ajustes sugeridos
          </h3>
          <div className="space-y-3">
            {payload.errors.length > 0 ? (
              payload.errors.map((error) => (
                <div className="rounded-lg border border-border bg-muted/20 p-4" key={`${error.original}-${error.fix}`}>
                  <div className="flex gap-3">
                    <CircleAlert className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="line-through">{error.original}</span>
                        <span className="mx-2 text-muted-foreground">→</span>
                        <span className="rounded bg-background px-2 py-1 font-medium">{error.fix}</span>
                      </p>
                      <p className="text-muted-foreground">{error.rule}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                No se detectaron errores relevantes en esta respuesta.
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-lg border border-border bg-muted/20 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Tu respuesta
            </h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
              {feedback.userAnswerEn}
            </p>
          </article>
          <article className="rounded-lg border border-border bg-accent/40 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Versión mejorada
            </h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground">
              {payload.improvedAnswer}
            </p>
          </article>
        </section>

        <section className="rounded-lg border border-border bg-muted/20 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Enfoque lingüístico
          </h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
            {payload.languageFocusComments}
          </p>
        </section>
      </CardContent>
    </Card>
  )
}
