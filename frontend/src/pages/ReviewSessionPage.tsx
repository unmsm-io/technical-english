import { ArrowLeft, Loader2, Search, Sparkles } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router"
import { getUsers } from "../api/users"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { EmptyState } from "../components/ui/empty-state"
import { MetricCard } from "../components/ui/metric-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { Skeleton } from "../components/ui/skeleton"
import { GradeButtons } from "../features/review/components/GradeButtons"
import { ReviewCard } from "../features/review/components/ReviewCard"
import { ReviewProgressBar } from "../features/review/components/ReviewProgressBar"
import { useReviewStore } from "../features/review/reviewStore"
import type { User } from "../types"
import type { ReviewGrade } from "../types/review"

export function ReviewSessionPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const selectedUserId = useReviewStore((state) => state.selectedUserId)
  const queue = useReviewStore((state) => state.queue)
  const currentCard = useReviewStore((state) => state.currentCard)
  const isFlipped = useReviewStore((state) => state.isFlipped)
  const isLoading = useReviewStore((state) => state.isLoading)
  const isGrading = useReviewStore((state) => state.isGrading)
  const productionMode = useReviewStore((state) => state.productionMode)
  const exampleSentence = useReviewStore((state) => state.exampleSentence)
  const feedback = useReviewStore((state) => state.feedback)
  const error = useReviewStore((state) => state.error)
  const sessionStats = useReviewStore((state) => state.sessionStats)
  const setSelectedUserId = useReviewStore((state) => state.setSelectedUserId)
  const setProductionMode = useReviewStore((state) => state.setProductionMode)
  const setExampleSentence = useReviewStore((state) => state.setExampleSentence)
  const flip = useReviewStore((state) => state.flip)
  const loadDue = useReviewStore((state) => state.loadDue)
  const gradeCurrent = useReviewStore((state) => state.gradeCurrent)

  const [users, setUsers] = useState<User[]>([])
  const [userLoading, setUserLoading] = useState(true)

  useEffect(() => {
    getUsers(0, 100)
      .then((page) => {
        setUsers(page.content)
        const queryUserId = Number(searchParams.get("userId") ?? "")
        if (queryUserId) {
          setSelectedUserId(queryUserId)
        }
      })
      .finally(() => setUserLoading(false))
  }, [searchParams, setSelectedUserId])

  useEffect(() => {
    if (!selectedUserId) {
      return
    }

    setSearchParams({ userId: String(selectedUserId) }, { replace: true })
    loadDue(selectedUserId, 20).catch(() => {})
  }, [loadDue, selectedUserId, setSearchParams])

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users]
  )

  const handleGrade = async (grade: ReviewGrade) => {
    await gradeCurrent(grade)
  }

  const reviewed = sessionStats.reviewed
  const remaining = currentCard ? queue.length : 0
  const elapsedMinutes = sessionStats.startedAt
    ? Math.max(1, Math.round((Date.now() - sessionStats.startedAt) / 60000))
    : 0

  if (userLoading) {
    return (
      <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-[420px] w-full rounded-[28px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Button asChild className="h-8 px-2 text-muted-foreground" size="sm" variant="ghost">
              <Link to={selectedUserId ? `/review/deck?userId=${selectedUserId}` : "/review/deck"}>
                <ArrowLeft className="size-4" />
                Salir del foco
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Sesión de repaso</h1>
              <p className="text-sm text-muted-foreground">
                Modo foco para consolidar memoria de largo plazo sin distracciones.
              </p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-[240px_auto]">
            <Select
              onValueChange={(value) => setSelectedUserId(value === "none" ? null : Number(value))}
              value={selectedUserId ? String(selectedUserId) : "none"}
            >
              <SelectTrigger aria-label="Usuario para repaso">
                <SelectValue placeholder="Selecciona un usuario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Selecciona un usuario</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={String(user.id)}>
                    {user.firstName} {user.lastName} · {user.codigo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              disabled={!selectedUserId || isLoading}
              onClick={() => selectedUserId && loadDue(selectedUserId, 20)}
              variant="outline"
            >
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
              Recargar sesión
            </Button>
          </div>
        </div>

        {selectedUser ? (
          <Alert>
            <AlertTitle>
              {selectedUser.firstName} {selectedUser.lastName}
            </AlertTitle>
            <AlertDescription>
              Las tarjetas y métricas se están calculando sobre su deck activo.
            </AlertDescription>
          </Alert>
        ) : null}

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Error de repaso</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {feedback ? (
          <Alert>
            <Sparkles className="size-4" />
            <AlertTitle>Feedback de producción</AlertTitle>
            <AlertDescription>
              {feedback.comment}
              {feedback.correctedSentence ? ` Corrección: ${feedback.correctedSentence}` : ""}
            </AlertDescription>
          </Alert>
        ) : null}

        {!selectedUserId ? (
          <EmptyState
            description="Selecciona un usuario para cargar las tarjetas que vencen hoy."
            icon={Search}
            title="Primero elige un estudiante"
          />
        ) : isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-[420px] w-full rounded-[28px]" />
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton className="h-16 w-full" key={index} />
              ))}
            </div>
          </div>
        ) : currentCard ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-4">
              <ReviewProgressBar remaining={remaining} reviewed={reviewed} />
              <ReviewCard
                card={currentCard}
                exampleSentence={exampleSentence}
                flipped={isFlipped}
                onExampleSentenceChange={setExampleSentence}
                onFlip={flip}
                productionMode={productionMode}
              />
            </div>

            <aside className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <MetricCard label="Revisadas" value={reviewed} />
                <MetricCard label="Pendientes" value={remaining} />
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Controles</CardTitle>
                  <CardDescription>
                    Activa producción para escribir tu propia frase antes de calificar.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm">
                    <input
                      checked={productionMode}
                      className="mt-1 h-4 w-4 accent-foreground"
                      onChange={(event) => setProductionMode(event.target.checked)}
                      type="checkbox"
                    />
                    <span className="space-y-1">
                      <span className="block font-medium text-foreground">Practicar producción</span>
                      <span className="block text-muted-foreground">
                        Envía una frase propia y recibe feedback corto sobre uso y precisión.
                      </span>
                    </span>
                  </label>
                  <GradeButtons
                    canGrade={isFlipped}
                    disabled={isGrading}
                    onFlip={flip}
                    onGrade={handleGrade}
                  />
                </CardContent>
              </Card>
            </aside>
          </div>
        ) : reviewed > 0 ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard label="Tarjetas revisadas" value={reviewed} />
              <MetricCard
                label="Retención de la sesión"
                value={`${reviewed === 0 ? 0 : Math.round((sessionStats.successful / reviewed) * 100)}%`}
              />
              <MetricCard label="Repetidas" value={sessionStats.repeated} />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Sesión completa</CardTitle>
                <CardDescription>
                  Revisaste {reviewed} tarjetas en aproximadamente {elapsedMinutes} minutos.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button onClick={() => selectedUserId && loadDue(selectedUserId, 20)}>
                  Otra sesión
                </Button>
                <Button asChild variant="outline">
                  <Link to={selectedUserId ? `/review/deck?userId=${selectedUserId}` : "/review/deck"}>
                    Ver deck
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <EmptyState
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild variant="outline">
                  <Link to={selectedUserId ? `/review/stats?userId=${selectedUserId}` : "/review/stats"}>
                    Ver estadísticas
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/tasks">Ir a tareas</Link>
                </Button>
              </div>
            }
            description="No quedan tarjetas por repasar en este momento. Puedes revisar estadísticas o cambiar de usuario."
            icon={Search}
            title="Deck al día"
          />
        )}
      </div>
    </div>
  )
}
