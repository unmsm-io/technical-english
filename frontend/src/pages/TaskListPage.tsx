import { ChevronLeft, ChevronRight, ListChecks, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { getUser } from "../api/users"
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
  const [taskType, setTaskType] = useState<TaskType | "">((searchParams.get("type") as TaskType | null) ?? "")
  const [cefrLevel, setCefrLevel] = useState<CefrLevel | "">((searchParams.get("cefr") as CefrLevel | null) ?? "")
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
    if (debouncedSearch) nextParams.set("q", debouncedSearch)
    if (taskType) nextParams.set("type", taskType)
    if (cefrLevel) nextParams.set("cefr", cefrLevel)
    if (page > 0) nextParams.set("page", String(page))
    if (selectedUserId) nextParams.set("userId", String(selectedUserId))
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
      cefr: cefrLevel || undefined,
      page,
      q: debouncedSearch || undefined,
      size: 10,
      type: taskType || undefined,
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
    <PageShell
      actions={
        <Button asChild>
          <a href={selectedUser ? `/tasks?userId=${selectedUser.id}&cefr=${selectedUser.englishLevel ?? ""}` : "/tasks"}>
            Comenzar tarea de mi nivel
          </a>
        </Button>
      }
      subtitle="Explora tareas auténticas de ingeniería para leer, escribir y justificar decisiones técnicas."
      title="Tareas"
    >
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_180px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Buscar tareas"
              className="pl-9"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por título o descripción"
              value={search}
            />
          </div>
          <Select
            onValueChange={(value) => {
              setTaskType((value as TaskType | "all") === "all" ? "" : (value as TaskType))
              setPage(0)
            }}
            value={taskType || "all"}
          >
            <SelectTrigger aria-label="Filtrar por tipo de tarea">
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {taskTypes.map((option) => (
                <SelectItem key={option.name} value={option.name}>
                  {option.displayNameEs}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => {
              setCefrLevel((value as CefrLevel | "all") === "all" ? "" : (value as CefrLevel))
              setPage(0)
            }}
            value={cefrLevel || "all"}
          >
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
          <Button
            disabled={!selectedUser?.englishLevel}
            onClick={() => {
              if (selectedUser?.englishLevel) {
                setCefrLevel(selectedUser.englishLevel as CefrLevel)
                setPage(0)
              }
            }}
            variant="outline"
          >
            Mi nivel
          </Button>
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
                description="Ajusta el tipo, nivel o búsqueda para explorar otro conjunto de tareas."
                icon={ListChecks}
                title="No hay tareas para estos filtros"
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Nivel</TableHead>
                      <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((task) => (
                      <TableRow className="cursor-pointer" key={task.id} onClick={() => navigate(detailPath(task.id))}>
                        <TableCell>
                          <div className="font-medium">{task.titleEs}</div>
                          <div className="mt-1 text-sm text-muted-foreground">{task.descriptionEs}</div>
                        </TableCell>
                        <TableCell><TaskTypeBadge type={task.taskType} /></TableCell>
                        <TableCell><CefrBadge level={task.cefrLevel} /></TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={(event) => {
                              event.stopPropagation()
                              navigate(detailPath(task.id))
                            }}
                          >
                            Comenzar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-muted-foreground">{totalElements} tareas en total</span>
                <div className="flex items-center gap-2">
                  <Button
                    disabled={isFirstPage}
                    onClick={() => setPage((current) => Math.max(0, current - 1))}
                    variant="outline"
                  >
                    <ChevronLeft className="size-4" />
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {page + 1} de {totalPages || 1}
                  </span>
                  <Button
                    disabled={isLastPage}
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
