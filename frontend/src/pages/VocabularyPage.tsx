import { ChevronLeft, ChevronRight, Languages, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { PageShell } from "../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { EmptyState } from "../components/ui/empty-state"
import { Input } from "../components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { Skeleton } from "../components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { getVocabulary } from "../features/vocabulary/VocabularyApi"
import { CefrBadge } from "../features/vocabulary/components/CefrBadge"
import { LayerBadge } from "../features/vocabulary/components/LayerBadge"
import type { EnglishLevel } from "../types"
import type { VocabularyItem, VocabularyLayer, VocabularyPageResponse } from "../types/vocabulary"

const layerOptions: Array<{ value: VocabularyLayer; label: string }> = [
  { value: "GSL", label: "GSL" },
  { value: "AWL", label: "AWL" },
  { value: "EEWL", label: "EEWL" },
  { value: "CSAWL", label: "CSAWL" },
]

const levelOptions: EnglishLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"]

function useInitialFilters() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  return {
    cefrLevel: (params.get("cefrLevel") as EnglishLevel | null) ?? "",
    layer: (params.get("layer") as VocabularyLayer | null) ?? "",
    q: params.get("q") ?? "",
  }
}

export function VocabularyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const initialFilters = useInitialFilters()
  const [search, setSearch] = useState(initialFilters.q)
  const [debouncedSearch, setDebouncedSearch] = useState(initialFilters.q)
  const [layer, setLayer] = useState<VocabularyLayer | "">(initialFilters.layer as VocabularyLayer | "")
  const [cefrLevel, setCefrLevel] = useState<EnglishLevel | "">(initialFilters.cefrLevel as EnglishLevel | "")
  const [page, setPage] = useState(0)
  const [data, setData] = useState<VocabularyPageResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(0)
    }, 300)
    return () => window.clearTimeout(timeoutId)
  }, [search])

  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set("q", debouncedSearch)
    if (layer) params.set("layer", layer)
    if (cefrLevel) params.set("cefrLevel", cefrLevel)
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true })
  }, [cefrLevel, debouncedSearch, layer, location.pathname, navigate])

  useEffect(() => {
    setLoading(true)
    setError(null)
    getVocabulary({
      cefrLevel: cefrLevel || undefined,
      layer: layer || undefined,
      page,
      q: debouncedSearch || undefined,
      size: 10,
    })
      .then(setData)
      .catch(() => setError("No se pudo cargar el vocabulario."))
      .finally(() => setLoading(false))
  }, [cefrLevel, debouncedSearch, layer, page])

  const items: VocabularyItem[] = data?.content ?? []

  return (
    <PageShell
      subtitle="Explora términos por capa lingüística, nivel CEFR y frecuencia."
      title="Navegador de vocabulario"
    >
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar término o definición"
              value={search}
            />
          </div>

          <Select onValueChange={(value) => {
            setLayer((value as VocabularyLayer | "all") === "all" ? "" : (value as VocabularyLayer))
            setPage(0)
          }} value={layer || "all"}>
            <SelectTrigger aria-label="Filtrar por capa">
              <SelectValue placeholder="Todas las capas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las capas</SelectItem>
              {layerOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => {
            setCefrLevel((value as EnglishLevel | "all") === "all" ? "" : (value as EnglishLevel))
            setPage(0)
          }} value={cefrLevel || "all"}>
            <SelectTrigger aria-label="Filtrar por nivel CEFR">
              <SelectValue placeholder="Todos los niveles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los niveles</SelectItem>
              {levelOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton className="h-16 w-full" key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="p-6">
              <Alert variant="destructive">
                <AlertTitle>Error de carga</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          ) : items.length === 0 ? (
            <div className="p-6">
              <EmptyState
                description="Ajusta la búsqueda o los filtros para probar otra combinación."
                icon={Languages}
                title="No se encontraron términos"
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Término</TableHead>
                      <TableHead>Capa</TableHead>
                      <TableHead>Nivel</TableHead>
                      <TableHead>Frecuencia</TableHead>
                      <TableHead>Definición</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow
                        className="cursor-pointer"
                        key={item.id}
                        onClick={() => navigate(`/vocabulary/${item.id}`)}
                      >
                        <TableCell>
                          <div className="font-medium">{item.term}</div>
                          <div className="text-xs text-muted-foreground">{item.partOfSpeech}</div>
                        </TableCell>
                        <TableCell><LayerBadge layer={item.layer} /></TableCell>
                        <TableCell><CefrBadge level={item.cefrLevel} /></TableCell>
                        <TableCell className="tabular-nums">{item.frequency.toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground">{item.definition}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Mostrando {items.length} de {data?.totalElements ?? 0} términos
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    disabled={data?.first}
                    onClick={() => setPage((current) => Math.max(current - 1, 0))}
                    variant="outline"
                  >
                    <ChevronLeft className="size-4" />
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {(data?.number ?? 0) + 1} de {data?.totalPages ?? 1}
                  </span>
                  <Button
                    disabled={data?.last}
                    onClick={() => setPage((current) => current + 1)}
                    variant="outline"
                  >
                    Siguiente
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </PageShell>
  )
}
