import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { getUser } from "../api/users"
import { SummativeApi } from "../features/summative/SummativeApi"
import { CefrBadge } from "../features/vocabulary/components/CefrBadge"
import type { User } from "../types"
import type {
  SummativeAttemptHistoryItem,
  SummativeTest,
} from "../types/summative"
import { TaskTypeBadge } from "../features/task/components/TaskTypeBadge"
import type { CefrLevel, TaskType } from "../types/task"

const levelOptions: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"]

const typeLabels: Array<{ value: TaskType; label: string }> = [
  { value: "ERROR_MESSAGE", label: "Mensaje de error" },
  { value: "API_DOC", label: "Documentación de API" },
  { value: "COMMIT_MSG", label: "Mensaje de commit" },
  { value: "PR_DESC", label: "Descripción de PR" },
  { value: "CODE_REVIEW", label: "Revisión de código" },
  { value: "TECH_REPORT", label: "Reporte técnico" },
]

export function SummativeListPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("q") ?? "")
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("q") ?? "")
  const [taskType, setTaskType] = useState<TaskType | "">(
    (searchParams.get("type") as TaskType | null) ?? ""
  )
  const [cefrLevel, setCefrLevel] = useState<CefrLevel | "">(
    (searchParams.get("cefr") as CefrLevel | null) ?? ""
  )
  const [page, setPage] = useState(Number(searchParams.get("page") ?? "0"))
  const [tests, setTests] = useState<SummativeTest[]>([])
  const [history, setHistory] = useState<SummativeAttemptHistoryItem[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [isFirstPage, setIsFirstPage] = useState(true)
  const [isLastPage, setIsLastPage] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const selectedUserId = useMemo(() => {
    const rawValue = searchParams.get("userId")
    return rawValue ? Number(rawValue) : null
  }, [searchParams])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(0)
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [search])

  useEffect(() => {
    const nextParams = new URLSearchParams()

    if (selectedUserId) {
      nextParams.set("userId", String(selectedUserId))
    }
    if (debouncedSearch) {
      nextParams.set("q", debouncedSearch)
    }
    if (taskType) {
      nextParams.set("type", taskType)
    }
    if (cefrLevel) {
      nextParams.set("cefr", cefrLevel)
    }
    if (page > 0) {
      nextParams.set("page", String(page))
    }

    setSearchParams(nextParams, { replace: true })
  }, [cefrLevel, debouncedSearch, page, searchParams, selectedUserId, setSearchParams, taskType])

  useEffect(() => {
    if (!selectedUserId) {
      setSelectedUser(null)
      setHistory([])
      return
    }

    Promise.all([getUser(selectedUserId), SummativeApi.getHistory(selectedUserId)])
      .then(([user, items]) => {
        setSelectedUser(user)
        setHistory(items)
      })
      .catch(() => {
        setSelectedUser(null)
        setHistory([])
      })
  }, [selectedUserId])

  useEffect(() => {
    setLoading(true)
    setError(null)

    SummativeApi.list({
      type: taskType || undefined,
      cefr: cefrLevel || undefined,
      q: debouncedSearch || undefined,
      page,
      size: 9,
    })
      .then((response) => {
        setTests(response.content)
        setTotalPages(response.totalPages || 1)
        setIsFirstPage(response.first)
        setIsLastPage(response.last)
      })
      .catch(() => setError("No se pudieron cargar las pruebas finales."))
      .finally(() => setLoading(false))
  }, [cefrLevel, debouncedSearch, page, taskType])

  const historyByTestId = useMemo(
    () =>
      history.reduce<Record<number, SummativeAttemptHistoryItem>>((accumulator, item) => {
        accumulator[item.testId] = item
        return accumulator
      }, {}),
    [history]
  )

  const buildRunPath = (testId: number) => {
    const params = new URLSearchParams()
    if (selectedUserId) {
      params.set("userId", String(selectedUserId))
    }
    return `/summative/${testId}/run${params.size > 0 ? `?${params.toString()}` : ""}`
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Pruebas finales</h1>
        <p className="text-sm text-gray-600">
          Evalúa lectura técnica, producción escrita y comprensión aplicada en un mismo flujo.
        </p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_160px_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              aria-label="Buscar pruebas finales"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por título o descripción"
              className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500"
            />
          </label>
          <select
            aria-label="Filtrar por tipo de prueba final"
            value={taskType}
            onChange={(event) => {
              setTaskType(event.target.value as TaskType | "")
              setPage(0)
            }}
            className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500"
          >
            <option value="">Todos los tipos</option>
            {typeLabels.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar por nivel CEFR de prueba final"
            value={cefrLevel}
            onChange={(event) => {
              setCefrLevel(event.target.value as CefrLevel | "")
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
          {selectedUser?.englishLevel ? (
            <button
              type="button"
              onClick={() => {
                setCefrLevel(selectedUser.englishLevel as CefrLevel)
                setPage(0)
              }}
              className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
            >
              Mi nivel
            </button>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 px-4 py-2.5 text-sm text-gray-500">
              {selectedUserId
                ? "El usuario seleccionado no tiene nivel CEFR."
                : "Agrega ?userId= al URL o entra desde un perfil para iniciar un intento."}
            </div>
          )}
        </div>
      </section>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-56 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-700">
          {error}
        </div>
      ) : tests.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-sm font-medium text-gray-900">
            No hay pruebas finales para estos filtros.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Ajusta la búsqueda o selecciona otro nivel.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tests.map((test) => {
            const completedAttempt = historyByTestId[test.id]

            return (
              <article
                key={test.id}
                className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <TaskTypeBadge type={test.taskType} />
                  <CefrBadge level={test.cefrLevel} />
                  {completedAttempt ? (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
                      Ya completado
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-4 text-lg font-semibold text-gray-900">{test.titleEs}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">{test.descriptionEs}</p>
                <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-gray-50 p-3">
                    <dt className="text-gray-500">Lectura</dt>
                    <dd className="mt-1 font-medium text-gray-900">1 spec</dd>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <dt className="text-gray-500">MCQ</dt>
                    <dd className="mt-1 font-medium text-gray-900">
                      {test.comprehensionQuestionCount} preguntas
                    </dd>
                  </div>
                </dl>
                {completedAttempt ? (
                  <p className="mt-4 text-sm text-gray-600">
                    Puntaje más reciente: {completedAttempt.overallScore ?? "Sin score"}
                  </p>
                ) : null}
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(buildRunPath(test.id))}
                    disabled={!selectedUserId}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    Comenzar
                  </button>
                  {completedAttempt ? (
                    <Link
                      to={`/summative/${test.id}/result/${completedAttempt.id}`}
                      className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      Ver resultado
                    </Link>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <button
          type="button"
          onClick={() => setPage((current) => Math.max(current - 1, 0))}
          disabled={isFirstPage}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </button>
        <p className="text-sm text-gray-600">
          Página {page + 1} de {totalPages}
        </p>
        <button
          type="button"
          onClick={() => setPage((current) => current + 1)}
          disabled={isLastPage}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
