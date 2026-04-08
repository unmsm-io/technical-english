import { ChevronLeft, ChevronRight, FileText, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { getUser } from "../api/users"
import { PageShell } from "../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
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
import { SummativeApi } from "../features/summative/SummativeApi"
import { TaskTypeBadge } from "../features/task/components/TaskTypeBadge"
import { CefrBadge } from "../features/vocabulary/components/CefrBadge"
import type { User } from "../types"
import type { SummativeAttemptHistoryItem, SummativeTest } from "../types/summative"
import type { CefrLevel, TaskType } from "../types/task"

const levelOptions: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"]

const typeLabels: Array<{ label: string; value: TaskType }> = [
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
  const [taskType, setTaskType] = useState<TaskType | "">((searchParams.get("type") as TaskType | null) ?? "")
  const [cefrLevel, setCefrLevel] = useState<CefrLevel | "">((searchParams.get("cefr") as CefrLevel | null) ?? "")
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

    if (selectedUserId) nextParams.set("userId", String(selectedUserId))
    if (debouncedSearch) nextParams.set("q", debouncedSearch)
    if (taskType) nextParams.set("type", taskType)
    if (cefrLevel) nextParams.set("cefr", cefrLevel)
    if (page > 0) nextParams.set("page", String(page))

    setSearchParams(nextParams, { replace: true })
  }, [cefrLevel, debouncedSearch, page, selectedUserId, setSearchParams, taskType])

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
      cefr: cefrLevel || undefined,
      page,
      q: debouncedSearch || undefined,
      size: 9,
      type: taskType || undefined,
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
    <PageShell
      subtitle="Seis pruebas integradas para cerrar lectura, producción y comprensión aplicada."
      title="Pruebas finales"
    >
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_160px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Buscar pruebas finales"
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
            <SelectTrigger aria-label="Filtrar por tipo de prueba final">
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {typeLabels.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
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
            <SelectTrigger aria-label="Filtrar por nivel CEFR de prueba final">
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

      {!selectedUserId ? (
        <Alert>
          <AlertTitle>Sin usuario seleccionado</AlertTitle>
          <AlertDescription>
            Abre esta vista con `?userId=` o llega desde una pantalla con contexto para iniciar un intento.
          </AlertDescription>
        </Alert>
      ) : null}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton className="h-64 w-full" key={index} />
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Error de carga</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : tests.length === 0 ? (
        <EmptyState
          description="Ajusta tipo, nivel o búsqueda para cargar otra combinación de pruebas."
          icon={FileText}
          title="No hay pruebas para estos filtros"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tests.map((test) => {
            const completedAttempt = historyByTestId[test.id]

            return (
              <Card key={test.id}>
                <CardHeader className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <TaskTypeBadge type={test.taskType} />
                    <CefrBadge level={test.cefrLevel} />
                    {completedAttempt ? <Badge variant="secondary">Ya completado</Badge> : null}
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{test.titleEs}</CardTitle>
                    <CardDescription>{test.descriptionEs}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg border border-border bg-muted/20 p-3">
                      <p className="text-muted-foreground">Lectura</p>
                      <p className="mt-1 font-medium">1 spec</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 p-3">
                      <p className="text-muted-foreground">MCQ</p>
                      <p className="mt-1 font-medium">{test.comprehensionQuestionCount} preguntas</p>
                    </div>
                  </div>
                  {completedAttempt ? (
                    <p className="text-sm text-muted-foreground">
                      Puntaje más reciente: {completedAttempt.overallScore ?? "Sin score"}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      disabled={!selectedUserId}
                      onClick={() => navigate(buildRunPath(test.id))}
                    >
                      Comenzar
                    </Button>
                    {completedAttempt ? (
                      <Button asChild variant="outline">
                        <Link to={`/summative/${test.id}/result/${completedAttempt.id}`}>
                          Ver resultado
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <Button
            disabled={isFirstPage}
            onClick={() => setPage((current) => Math.max(current - 1, 0))}
            size="sm"
            variant="outline"
          >
            <ChevronLeft className="size-4" />
            Anterior
          </Button>
          <p className="text-sm text-muted-foreground">
            Página {page + 1} de {totalPages}
          </p>
          <Button
            disabled={isLastPage}
            onClick={() => setPage((current) => current + 1)}
            size="sm"
            variant="outline"
          >
            Siguiente
            <ChevronRight className="size-4" />
          </Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
