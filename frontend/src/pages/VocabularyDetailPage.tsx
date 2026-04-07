import { ArrowLeft, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router"
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
      setError("No se encontro el termino solicitado.")
      setLoading(false)
      return
    }

    getVocabularyItem(Number(id))
      .then(setItem)
      .catch(() => setError("No se pudo cargar el detalle del termino."))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-16 text-sm text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        Cargando detalle...
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="space-y-4 py-16 text-center">
        <p className="text-sm text-red-600">{error ?? "Termino no encontrado."}</p>
        <Link
          to="/vocabulary"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al vocabulario
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/vocabulary"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al vocabulario
      </Link>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-gray-500">
              Termino tecnico
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-gray-900">
              {item.term}
            </h1>
            <p className="mt-2 text-sm text-gray-500">{item.partOfSpeech}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LayerBadge layer={item.layer} />
            <CefrBadge level={item.cefrLevel} />
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Definicion
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-700">{item.definition}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Ejemplo
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-700">
              {item.exampleSentence}
            </p>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 rounded-xl border border-gray-200 p-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Frecuencia
            </dt>
            <dd className="mt-1 text-sm text-gray-800">
              {item.frequency.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Token protegido
            </dt>
            <dd className="mt-1 text-sm text-gray-800">
              {item.protectedToken ? "Si" : "No"}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
