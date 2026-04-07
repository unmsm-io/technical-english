import { Loader2, PlayCircle } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { getUsers } from "../api/users"
import { startDiagnostic } from "../features/diagnostic/DiagnosticApi"
import { useDiagnosticStore } from "../features/diagnostic/diagnosticStore"
import type { User } from "../types"

export function DiagnosticStartPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const selectedUserId = useDiagnosticStore((state) => state.selectedUserId)
  const setSelectedUserId = useDiagnosticStore((state) => state.setSelectedUserId)
  const startAttempt = useDiagnosticStore((state) => state.startAttempt)
  const reset = useDiagnosticStore((state) => state.reset)

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getUsers(0, 100)
      .then((page) => {
        setUsers(page.content)
        const queryUserId = Number(searchParams.get("userId"))
        if (queryUserId) {
          setSelectedUserId(queryUserId)
        }
      })
      .catch(() => setError("No se pudo cargar la lista de usuarios."))
      .finally(() => setLoading(false))
  }, [searchParams, setSelectedUserId])

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users]
  )

  const handleStart = async () => {
    if (!selectedUserId) {
      setError("Selecciona un usuario antes de comenzar.")
      return
    }

    setStarting(true)
    setError(null)

    try {
      reset()
      setSelectedUserId(selectedUserId)
      const payload = await startDiagnostic(selectedUserId)
      startAttempt(payload)
      navigate("/diagnostic/test")
    } catch {
      setError("No se pudo iniciar el diagnostico.")
    } finally {
      setStarting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Diagnóstico inicial</h1>
        <p className="text-sm text-gray-600">
          Este test ubica al estudiante entre A1 y C1 con 15 items de lectura,
          vocabulario y gramatica aplicada a contextos de ingenieria.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-10 text-sm text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            Cargando usuarios...
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Usuario
              </label>
              <select
                value={selectedUserId ?? ""}
                onChange={(event) =>
                  setSelectedUserId(
                    event.target.value ? Number(event.target.value) : null
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
              >
                <option value="">Selecciona un usuario</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} · {user.codigo}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-3">
              <div>
                <p className="font-semibold text-slate-900">Duración estimada</p>
                <p className="mt-1">8 a 10 minutos</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Cobertura</p>
                <p className="mt-1">Lectura, vocabulario y gramatica</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Resultado</p>
                <p className="mt-1">Placement CEFR y tamaño vocabular estimado</p>
              </div>
            </div>

            {selectedUser ? (
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                El diagnostico se registrará para {selectedUser.firstName}{" "}
                {selectedUser.lastName}.
              </div>
            ) : null}

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleStart}
                disabled={!selectedUserId || starting}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {starting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PlayCircle className="h-4 w-4" />
                )}
                Comenzar diagnóstico
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
