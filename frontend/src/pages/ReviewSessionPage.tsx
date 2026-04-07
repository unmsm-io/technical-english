import { Loader2, Sparkles } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { getUsers } from "../api/users"
import { GradeButtons } from "../features/review/components/GradeButtons"
import { ReviewCard } from "../features/review/components/ReviewCard"
import { ReviewProgressBar } from "../features/review/components/ReviewProgressBar"
import { useReviewStore } from "../features/review/reviewStore"
import type { User } from "../types"
import type { ReviewGrade } from "../types/review"

export function ReviewSessionPage() {
  const navigate = useNavigate()
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
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">Sesión de repaso</h1>
          <p className="text-sm text-slate-600">
            Vuelve a las palabras clave hasta consolidarlas en memoria de largo plazo.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            aria-label="Usuario para repaso"
            value={selectedUserId ?? ""}
            onChange={(event) => setSelectedUserId(event.target.value ? Number(event.target.value) : null)}
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
          >
            <option value="">Selecciona un usuario</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} · {user.codigo}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => selectedUserId && loadDue(selectedUserId, 20)}
            disabled={!selectedUserId || isLoading}
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Recargar sesión
          </button>
        </div>
      </div>

      {selectedUser ? (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-900">
          Repasando como {selectedUser.firstName} {selectedUser.lastName}.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {feedback ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-4 w-4" />
            <div className="space-y-1">
              <p className="font-medium">Feedback de producción</p>
              <p>{feedback.comment}</p>
              {feedback.correctedSentence ? (
                <p className="text-emerald-700">Corrección: {feedback.correctedSentence}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {!selectedUserId ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
          <p className="text-base font-medium text-slate-900">
            Selecciona un usuario para iniciar una sesión de repaso.
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
        </div>
      ) : currentCard ? (
        <>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-4">
              <ReviewProgressBar reviewed={reviewed} remaining={remaining} />
              <ReviewCard
                card={currentCard}
                flipped={isFlipped}
                productionMode={productionMode}
                exampleSentence={exampleSentence}
                onFlip={flip}
                onExampleSentenceChange={setExampleSentence}
              />
            </div>

            <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">En cola</p>
                <p className="mt-1">{remaining} tarjetas restantes</p>
              </div>
              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={productionMode}
                  onChange={(event) => setProductionMode(event.target.checked)}
                  className="mt-1 h-4 w-4"
                />
                <span>
                  <span className="font-medium text-slate-900">Practicar producción</span>
                  <span className="mt-1 block text-slate-600">
                    Envía una frase propia para recibir feedback corto del término.
                  </span>
                </span>
              </label>
              <GradeButtons
                disabled={isGrading}
                canGrade={isFlipped}
                onFlip={flip}
                onGrade={handleGrade}
              />
            </aside>
          </div>
        </>
      ) : reviewed > 0 ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <h2 className="text-2xl font-semibold text-emerald-900">Sesión completa</h2>
          <p className="mt-2 text-sm text-emerald-800">
            Revisaste {reviewed} tarjetas en aproximadamente {elapsedMinutes} minutos.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white px-4 py-5">
              <p className="text-sm text-slate-500">Tarjetas revisadas</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{reviewed}</p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-5">
              <p className="text-sm text-slate-500">Retención de la sesión</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {reviewed === 0 ? 0 : Math.round((sessionStats.successful / reviewed) * 100)}%
              </p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-5">
              <p className="text-sm text-slate-500">Repetidas</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{sessionStats.repeated}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => selectedUserId && loadDue(selectedUserId, 20)}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Otra sesión
            </button>
            <button
              type="button"
              onClick={() => navigate(selectedUserId ? `/review/deck?userId=${selectedUserId}` : "/review/deck")}
              className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Ver deck
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
          <p className="text-lg font-medium text-slate-900">
            Tu deck está al día.
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Vuelve más tarde o aprovecha para practicar con tareas TBLT.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              to={selectedUserId ? `/review/stats?userId=${selectedUserId}` : "/review/stats"}
              className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Ver estadísticas
            </Link>
            <Link
              to="/tasks"
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Ir a tareas
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
