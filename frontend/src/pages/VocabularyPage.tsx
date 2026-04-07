import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { getVocabulary } from "../features/vocabulary/VocabularyApi"
import { CefrBadge } from "../features/vocabulary/components/CefrBadge"
import { LayerBadge } from "../features/vocabulary/components/LayerBadge"
import type { EnglishLevel } from "../types"
import type {
  VocabularyItem,
  VocabularyLayer,
  VocabularyPageResponse,
} from "../types/vocabulary"

const layerOptions: Array<{ value: VocabularyLayer; label: string }> = [
  { value: "GSL", label: "GSL" },
  { value: "AWL", label: "AWL" },
  { value: "EEWL", label: "EEWL" },
  { value: "CSAWL", label: "CSAWL" },
]

const levelOptions: EnglishLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"]

function useInitialFilters(): {
  q: string
  layer: VocabularyLayer | ""
  cefrLevel: EnglishLevel | ""
} {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  return {
    q: params.get("q") ?? "",
    layer: (params.get("layer") as VocabularyLayer | null) ?? "",
    cefrLevel: (params.get("cefrLevel") as EnglishLevel | null) ?? "",
  }
}

export function VocabularyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const initialFilters = useInitialFilters()
  const [search, setSearch] = useState(initialFilters.q)
  const [debouncedSearch, setDebouncedSearch] = useState(initialFilters.q)
  const [layer, setLayer] = useState<VocabularyLayer | "">(initialFilters.layer)
  const [cefrLevel, setCefrLevel] = useState<EnglishLevel | "">(initialFilters.cefrLevel)
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
    if (debouncedSearch) {
      params.set("q", debouncedSearch)
    }
    if (layer) {
      params.set("layer", layer)
    }
    if (cefrLevel) {
      params.set("cefrLevel", cefrLevel)
    }
    navigate(
      {
        pathname: location.pathname,
        search: params.toString(),
      },
      { replace: true }
    )
  }, [cefrLevel, debouncedSearch, layer, location.pathname, navigate])

  useEffect(() => {
    setLoading(true)
    setError(null)
    getVocabulary({
      q: debouncedSearch || undefined,
      layer: layer || undefined,
      cefrLevel: cefrLevel || undefined,
      page,
      size: 10,
    })
      .then(setData)
      .catch(() => setError("No se pudo cargar el vocabulario."))
      .finally(() => setLoading(false))
  }, [cefrLevel, debouncedSearch, layer, page])

  const items: VocabularyItem[] = data?.content ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">
          Navegador de vocabulario
        </h1>
        <p className="text-sm text-gray-600">
          Explora terminos por capa linguistica, nivel CEFR y frecuencia.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar termino o definicion"
              className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none ring-0 transition focus:border-blue-500"
            />
          </label>

          <select
            value={layer}
            onChange={(event) => {
              setLayer(event.target.value as VocabularyLayer | "")
              setPage(0)
            }}
            className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500"
          >
            <option value="">Todas las capas</option>
            {layerOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={cefrLevel}
            onChange={(event) => {
              setCefrLevel(event.target.value as EnglishLevel | "")
              setPage(0)
            }}
            className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500"
          >
            <option value="">Todos los niveles</option>
            {levelOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            Cargando vocabulario...
          </div>
        ) : error ? (
          <div className="px-6 py-16 text-center text-sm text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-gray-600">
              No se encontraron terminos con los filtros actuales.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-3">Termino</th>
                    <th className="px-5 py-3">Capa</th>
                    <th className="px-5 py-3">Nivel</th>
                    <th className="px-5 py-3">Frecuencia</th>
                    <th className="px-5 py-3">Definicion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`/vocabulary/${item.id}`)}
                      className="cursor-pointer transition hover:bg-blue-50/50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900">{item.term}</div>
                        <div className="text-xs text-gray-500">{item.partOfSpeech}</div>
                      </td>
                      <td className="px-5 py-4">
                        <LayerBadge layer={item.layer} />
                      </td>
                      <td className="px-5 py-4">
                        <CefrBadge level={item.cefrLevel} />
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {item.frequency.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {item.definition}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-600">
                Mostrando {items.length} de {data?.totalElements ?? 0} terminos
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(current - 1, 0))}
                  disabled={data?.first}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>
                <span className="text-sm text-gray-600">
                  Pagina {(data?.number ?? 0) + 1} de {data?.totalPages ?? 1}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={data?.last}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
