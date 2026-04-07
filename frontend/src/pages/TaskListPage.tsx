import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { getUser } from "../api/users"
import { TaskApi } from "../features/task/TaskApi"
import { TaskTypeBadge } from "../features/task/components/TaskTypeBadge"
import { CefrBadge } from "../features/vocabulary/components/CefrBadge"
import type { User } from "../types"
import type { CefrLevel, Task, TaskType, TaskTypeMeta } from "../types/task"

const fallbackTaskTypes: TaskTypeMeta[] = [
  { name: "ERROR_MESSAGE", displayNameEs: "Mensaje de error" },
  { name: "API_DOC", displayNameEs: "Documentación de API" },
  { name: "COMMIT_MSG", displayNameEs: "Mensaje de commit" },
  { name: "PR_DESC", displayNameEs: "Descripción de PR" },
  { name: "CODE_REVIEW", displayNameEs: "Revisión de código" },
  { name: "TECH_REPORT", displayNameEs: "Reporte técnico" },
]

const levelOptions: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"]

export function TaskListPage() {
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
  const [items, setItems] = useState<Task[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isFirstPage, setIsFirstPage] = useState(true)
  const [isLastPage, setIsLastPage] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [taskTypes, setTaskTypes] = useState<TaskTypeMeta[]>(fallbackTaskTypes)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

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
    if (selectedUserId) {
      nextParams.set("userId", String(selectedUserId))
    }

    setSearchParams(nextParams, { replace: true })
  }, [cefrLevel, debouncedSearch, page, selectedUserId, setSearchParams, taskType])

  useEffect(() => {
    TaskApi.getTypes().then(setTaskTypes).catch(() => setTaskTypes(fallbackTaskTypes))
  }, [])

  useEffect(() => {
    if (!selectedUserId) {
      setSelectedUser(null)
      return
    }

    getUser(selectedUserId).then(setSelectedUser).catch(() => setSelectedUser(null))
  }, [selectedUserId])

  useEffect(() => {
    setLoading(true)
    setError(null)

    TaskApi.list({
      type: taskType || undefined,
      cefr: cefrLevel || undefined,
      q: debouncedSearch || undefined,
      page,
      size: 10,
    })
      .then((response) => {
        setItems(response.content)
        setTotalElements(response.totalElements)
        setTotalPages(response.totalPages || 1)
        setIsFirstPage(response.first)
        setIsLastPage(response.last)
      })
      .catch(() => setError("No se pudieron cargar las tareas TBLT."))
      .finally(() => setLoading(false))
  }, [cefrLevel, debouncedSearch, page, taskType])

  const detailPath = (taskId: number) =>
    selectedUserId ? `/tasks/${taskId}?userId=${selectedUserId}` : `/tasks/${taskId}`

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Tareas TBLT</h1>
        <p className="text-sm text-gray-600">
          Explora tareas auténticas de ingeniería para leer, escribir y justificar
          decisiones técnicas en inglés.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_160px_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              aria-label="Buscar tareas"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por título o descripción"
              className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500"
            />
          </label>

          <select
            aria-label="Filtrar por tipo de tarea"
            value={taskType}
            onChange={(event) => {
              setTaskType(event.target.value as TaskType | "")
              setPage(0)
            }}
            className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500"
          >
            <option value="">Todos los tipos</option>
            {taskTypes.map((option) => (
              <option key={option.name} value={option.name}>
                {option.displayNameEs}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar por nivel CEFR"
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
              {selectedUser
                ? "El usuario no tiene nivel CEFR asignado."
                : "Selecciona un usuario desde su perfil para usar Mi nivel."}
            </div>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-xl bg-gray-100"
              />
            ))}
          </div>
        ) : error ? (
          <div className="px-6 py-16 text-center text-sm text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-medium text-gray-900">
              No hay tareas que coincidan con estos filtros.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Ajusta el tipo, nivel o búsqueda para explorar otro conjunto de tareas.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-3">Título</th>
                    <th className="px-5 py-3">Tipo</th>
                    <th className="px-5 py-3">Nivel</th>
                    <th className="px-5 py-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((task) => (
                    <tr
                      key={task.id}
                      onClick={() => navigate(detailPath(task.id))}
                      className="cursor-pointer transition hover:bg-blue-50/60"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900">{task.titleEs}</div>
                        <div className="mt-1 text-sm text-gray-600">
                          {task.descriptionEs}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <TaskTypeBadge type={task.taskType} />
                      </td>
                      <td className="px-5 py-4">
                        <CefrBadge level={task.cefrLevel} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            navigate(detailPath(task.id))
                          }}
                          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                        >
                          Comenzar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-600">
                Mostrando {items.length} de {totalElements} tareas disponibles
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(current - 1, 0))}
                  disabled={isFirstPage}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>
                <span className="text-sm text-gray-600">
                  Página {page + 1} de {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={isLastPage}
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
