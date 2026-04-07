import { Loader2, SearchCheck } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router"
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
      setError("Ingresa un texto tecnico para analizar.")
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
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Perfilador de texto</h1>
        <p className="text-sm text-gray-600">
          Evalua la cobertura lexica de un texto tecnico y separa tokens protegidos del vocabulario aprendible.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Texto de entrada
          </label>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Pega aqui una descripcion tecnica, un error message o un fragmento de documentacion."
            className="min-h-64 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
          />
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              Los tokens protegidos como `NullPointerException` o --verbose no penalizan el umbral de 95%.
            </p>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchCheck className="h-4 w-4" />}
              Analizar texto
            </button>
          </div>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Resumen</h2>
          {result ? (
            <div className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <StatCard label="Cobertura conocida" value={`${result.knownPercentage.toFixed(2)}%`} />
                <StatCard label="Umbral 95%" value={result.meetsThreshold ? "Cumple" : "No cumple"} />
                <StatCard label="Tokens protegidos" value={String(result.protectedTokens.length)} />
                <StatCard label="Terminos desconocidos" value={String(result.unknownTerms.length)} />
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Tokens desconocidos
                </p>
                <div className="mt-3">
                  <UnknownTermsList terms={result.unknownTerms} onSelect={setSelectedUnknown} />
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              Ejecuta un analisis para ver la cobertura, los tokens protegidos y los terminos desconocidos.
            </p>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Texto resaltado</h2>
          <p className="text-sm text-gray-500">
            Verde: conocido. Rojo: desconocido. Gris: protegido.
          </p>
        </div>
        <HighlightedText tokens={result?.tokens ?? []} />
      </section>

      {selectedUnknown ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Termino desconocido: {selectedUnknown}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Puedes revisar este termino en el navegador de vocabulario para ver su definicion, capa y nivel CEFR.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedUnknown(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => navigate(`/vocabulary?q=${encodeURIComponent(selectedUnknown)}`)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
              >
                Buscar en vocabulario
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}
