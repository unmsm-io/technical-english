import { ArrowLeft, BookOpenText, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router"
import { PageShell } from "../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/breadcrumb"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { EmptyState } from "../components/ui/empty-state"
import { MetricCard } from "../components/ui/metric-card"
import { getVocabularyItem } from "../features/vocabulary/VocabularyApi"
import { CefrBadge } from "../features/vocabulary/components/CefrBadge"
import { LayerBadge } from "../features/vocabulary/components/LayerBadge"
import type { VocabularyItem } from "../types/vocabulary"

export function VocabularyDetailPage() {
  const { id } = useParams()
  const [item, setItem] = useState<VocabularyItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError("No se encontró el término solicitado.")
      setLoading(false)
      return
    }

    getVocabularyItem(Number(id))
      .then(setItem)
      .catch(() => setError("No se pudo cargar el detalle del término."))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <PageShell
      actions={
        <Button asChild variant="outline">
          <Link to="/vocabulary">
            <ArrowLeft className="size-4" />
            Volver al vocabulario
          </Link>
        </Button>
      }
      subtitle="Ficha léxica con definición, ejemplo y señales de complejidad para el estudiante."
      title={item?.term ?? "Detalle de vocabulario"}
    >
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Panel</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/vocabulary">Vocabulario</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{item?.term ?? "Detalle"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center gap-3 py-16 text-sm text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            Cargando detalle...
          </CardContent>
        </Card>
      ) : error || !item ? (
        <Alert variant="destructive">
          <AlertTitle>No se pudo abrir el término</AlertTitle>
          <AlertDescription>{error ?? "Término no encontrado."}</AlertDescription>
        </Alert>
      ) : (
        <>
          <Card>
            <CardHeader className="gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <CardDescription>Término técnico</CardDescription>
                <CardTitle className="text-3xl">{item.term}</CardTitle>
                <p className="text-sm text-muted-foreground">{item.partOfSpeech}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <LayerBadge layer={item.layer} />
                <CefrBadge level={item.cefrLevel} />
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-[minmax(0,1fr)_260px]">
              <div className="grid gap-6">
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-base">Definición</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm leading-7 text-muted-foreground">
                    {item.definition}
                  </CardContent>
                </Card>
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-base">Ejemplo</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm leading-7 text-muted-foreground">
                    {item.exampleSentence}
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4">
                <MetricCard label="Frecuencia" value={item.frequency.toLocaleString()} />
                <MetricCard
                  label="Token protegido"
                  trend={item.protectedToken ? "up" : "flat"}
                  value={item.protectedToken ? "Sí" : "No"}
                />
              </div>
            </CardContent>
          </Card>

          <EmptyState
            action={
              <Button asChild variant="outline">
                <Link to={`/profiler?q=${encodeURIComponent(item.term)}`}>Abrir perfilador</Link>
              </Button>
            }
            description="Usa este término como referencia para analizar cobertura léxica en un texto más largo."
            icon={BookOpenText}
            title="Siguiente paso recomendado"
          />
        </>
      )}
    </PageShell>
  )
}
