import { Loader2, SearchCheck, TextSearch } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router"
import { PageShell } from "../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { EmptyState } from "../components/ui/empty-state"
import { Label } from "../components/ui/label"
import { MetricCard } from "../components/ui/metric-card"
import { Textarea } from "../components/ui/textarea"
import { profileText } from "../features/vocabulary/VocabularyApi"
import { HighlightedText } from "../features/vocabulary/components/HighlightedText"
import { UnknownTermsList } from "../features/vocabulary/components/UnknownTermsList"
import type { ProfileResult } from "../types/vocabulary"

export function ProfilerPage() {
  const navigate = useNavigate()
  const [text, setText] = useState("")
  const [result, setResult] = useState<ProfileResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedUnknown, setSelectedUnknown] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError("Ingresa un texto técnico para analizar.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const profile = await profileText(text)
      setResult(profile)
    } catch {
      setError("No se pudo analizar el texto.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell
      actions={
        <Button disabled={loading} onClick={handleAnalyze}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <SearchCheck className="size-4" />}
          Analizar texto
        </Button>
      }
      subtitle="Evalúa cobertura léxica, términos protegidos y vocabulario técnico que todavía no dominas."
      title="Perfilador de texto"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Texto de entrada</CardTitle>
            <CardDescription>
              Pega una descripción técnica, un error message o un fragmento de documentación.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profiler-text">Contenido</Label>
              <Textarea
                id="profiler-text"
                onChange={(event) => setText(event.target.value)}
                placeholder="Pega aquí una descripción técnica, un error message o un fragmento de documentación."
                rows={14}
                value={text}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Los tokens protegidos como `NullPointerException` o `--verbose` no penalizan el umbral de 95%.
            </p>
            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Error de análisis</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
            <CardDescription>
              Indicadores de cobertura, cumplimiento del umbral y términos pendientes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <MetricCard label="Cobertura conocida" value={`${result.knownPercentage.toFixed(2)}%`} />
                  <MetricCard
                    label="Umbral del 95%"
                    trend={result.meetsThreshold ? "up" : "down"}
                    value={result.meetsThreshold ? "Cumple" : "No cumple"}
                  />
                  <MetricCard label="Tokens protegidos" value={result.protectedTokens.length} />
                  <MetricCard label="Términos desconocidos" value={result.unknownTerms.length} />
                </div>
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-base">Términos desconocidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UnknownTermsList terms={result.unknownTerms} onSelect={setSelectedUnknown} />
                  </CardContent>
                </Card>
              </>
            ) : (
              <EmptyState
                description="Ejecuta un análisis para ver cobertura, tokens protegidos y términos desconocidos."
                icon={TextSearch}
                title="Aún no hay resultados"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Texto resaltado</CardTitle>
          <CardDescription>Conocido en neutro, desconocido con énfasis y protegido en tono tenue.</CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <HighlightedText tokens={result.tokens} />
          ) : (
            <EmptyState
              description="Cuando analices un texto verás aquí el contenido anotado token por token."
              icon={TextSearch}
              title="Sin texto procesado"
            />
          )}
        </CardContent>
      </Card>

      <Dialog onOpenChange={(open) => !open && setSelectedUnknown(null)} open={selectedUnknown !== null}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Término desconocido: {selectedUnknown}</DialogTitle>
            <DialogDescription>
              Puedes abrir el navegador de vocabulario para revisar definición, capa y nivel CEFR.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSelectedUnknown(null)} variant="outline">
              Cerrar
            </Button>
            <Button
              onClick={() => {
                if (selectedUnknown) {
                  navigate(`/vocabulary?q=${encodeURIComponent(selectedUnknown)}`)
                }
              }}
            >
              Buscar en vocabulario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
