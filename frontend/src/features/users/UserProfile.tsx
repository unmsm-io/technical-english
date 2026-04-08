import { Building, Calendar, ClipboardCheck, GraduationCap, Mail, Pencil, Trash2, UserCircle2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { deleteUser, getUser, patchUserProfile } from "../../api/users"
import { PageShell } from "../../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Checkbox } from "../../components/ui/checkbox"
import { EmptyState } from "../../components/ui/empty-state"
import { MetricCard } from "../../components/ui/metric-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { getDiagnosticHistory } from "../diagnostic/DiagnosticApi"
import { MasteryApi } from "../mastery/MasteryApi"
import { MasteryRadarChart } from "../mastery/components/MasteryRadarChart"
import { PortfolioApi } from "../portfolio/PortfolioApi"
import { ReviewApi } from "../review/ReviewApi"
import { TaskApi } from "../task/TaskApi"
import { TaskTypeBadge } from "../task/components/TaskTypeBadge"
import type { User } from "../../types"
import type { DiagnosticAttemptHistory } from "../../types/diagnostic"
import type { MasteryRadarResponse, ReviewStats } from "../../types"
import type { PortfolioResponse } from "../../types/portfolio"
import type { TaskAttemptHistoryItem } from "../../types/task"

const targetSkillOptions = [
  { value: "READING_DOCS", label: "Lectura de documentación" },
  { value: "ERROR_MESSAGES", label: "Interpretar error messages" },
  { value: "API_NAVIGATION", label: "Navegación de APIs" },
  { value: "WRITING_REPORTS", label: "Redacción técnica" },
  { value: "TEAM_COMMUNICATION", label: "Comunicación en equipo" },
  { value: "TECH_PRESENTATIONS", label: "Presentaciones técnicas" },
]

export function UserProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [history, setHistory] = useState<DiagnosticAttemptHistory[]>([])
  const [taskHistory, setTaskHistory] = useState<TaskAttemptHistoryItem[]>([])
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null)
  const [masteryRadar, setMasteryRadar] = useState<MasteryRadarResponse | null>(null)
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    const userId = Number(id)
    Promise.all([getUser(userId), getDiagnosticHistory(userId), TaskApi.getHistory(userId)])
      .then(([userData, historyData, taskHistoryData]) => {
        setUser(userData)
        setHistory(historyData)
        setTaskHistory(taskHistoryData)
        setSelectedSkills(userData.targetSkills)
        if (userData.englishLevel) {
          ReviewApi.getStats(userId).then(setReviewStats).catch(() => setReviewStats(null))
          MasteryApi.getStudentMasteryRadar(userId).then(setMasteryRadar).catch(() => setMasteryRadar(null))
        }
        PortfolioApi.getCurrent(userId).then(setPortfolio).catch(() => setPortfolio(null))
      })
      .catch(() => setError("No se pudo cargar el perfil del usuario."))
      .finally(() => setLoading(false))
  }, [id])

  const roleVariant = useMemo(
    () => (role: string) => (role === "ADMIN" ? "default" : role === "TEACHER" ? "secondary" : "outline"),
    []
  )

  const handleDelete = async () => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return
    try {
      await deleteUser(Number(id))
      navigate("/users")
    } catch {
      setError("No se pudo eliminar el usuario.")
    }
  }

  const handleToggleSkill = (value: string) => {
    setSelectedSkills((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    )
  }

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)
    setSaveMessage(null)
    setError(null)
    try {
      const updatedUser = await patchUserProfile(user.id, {
        diagnosticCompleted: user.diagnosticCompleted,
        diagnosticCompletedAt: user.diagnosticCompletedAt ?? undefined,
        targetSkills: selectedSkills,
        vocabularySize: user.vocabularySize ?? undefined,
      })
      setUser(updatedUser)
      setSaveMessage("Perfil actualizado correctamente.")
    } catch {
      setError("No se pudo actualizar el perfil.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Cargando perfil...</div>
  }

  if (error || !user) {
    return (
      <PageShell subtitle="No se pudo abrir el perfil solicitado." title="Perfil de usuario">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Usuario no encontrado."}</AlertDescription>
        </Alert>
      </PageShell>
    )
  }

  return (
    <PageShell
      actions={
        <>
          <Button onClick={() => navigate(`/users/${user.id}/edit`)} variant="outline">
            <Pencil className="size-4" />
            Editar
          </Button>
          <Button onClick={handleDelete} variant="ghost">
            <Trash2 className="size-4" />
            Eliminar
          </Button>
        </>
      }
      subtitle="Resumen académico, seguimiento y actividad reciente del estudiante."
      title="Perfil de usuario"
    >
      <Card>
        <CardContent className="flex flex-col gap-6 pt-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback>
                <UserCircle2 className="size-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                {user.firstName} {user.lastName}
              </h2>
              <p className="font-mono text-sm text-muted-foreground">{user.codigo}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant={roleVariant(user.role) as "default" | "outline" | "secondary"}>{user.role}</Badge>
                {user.englishLevel ? <Badge variant="outline">{user.englishLevel}</Badge> : null}
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoBlock icon={<Mail className="size-4" />} label="Email" value={user.email} />
            <InfoBlock icon={<GraduationCap className="size-4" />} label="Nivel" value={user.englishLevel || "No asignado"} />
            <InfoBlock icon={<Building className="size-4" />} label="Facultad" value={user.faculty || "No registrada"} />
            <InfoBlock icon={<Calendar className="size-4" />} label="Registro" value={new Date(user.createdAt).toLocaleDateString()} />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mastery">Mastery</TabsTrigger>
          <TabsTrigger value="portfolio">Portafolio</TabsTrigger>
          <TabsTrigger value="tasks">Tareas</TabsTrigger>
          <TabsTrigger value="reviews">Repaso</TabsTrigger>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-6" value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Nivel e intereses</CardTitle>
              <CardDescription>Ajusta objetivos del estudiante y lanza el diagnóstico desde este perfil.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard label="Diagnóstico" value={user.diagnosticCompleted ? "Completado" : "Pendiente"} />
                <MetricCard label="Tamaño vocabular" value={user.vocabularySize ?? "Sin estimar"} />
                <MetricCard label="Último diagnóstico" value={user.diagnosticCompletedAt ? new Date(user.diagnosticCompletedAt).toLocaleDateString() : "Sin fecha"} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {targetSkillOptions.map((option) => {
                  const checked = selectedSkills.includes(option.value)
                  return (
                    <label className="flex items-start gap-3 rounded-lg border p-4" key={option.value}>
                      <Checkbox checked={checked} onCheckedChange={() => handleToggleSkill(option.value)} />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  )
                })}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={handleSaveProfile}>{saving ? "Guardando..." : "Guardar intereses"}</Button>
                <Button asChild variant="outline">
                  <Link to={`/diagnostic/start?userId=${user.id}`}>
                    <ClipboardCheck className="size-4" />
                    Tomar diagnóstico
                  </Link>
                </Button>
              </div>
              {saveMessage ? (
                <Alert variant="success">
                  <AlertTitle>Perfil actualizado</AlertTitle>
                  <AlertDescription>{saveMessage}</AlertDescription>
                </Alert>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="mastery">
          <Card>
            <CardHeader>
              <CardTitle>Mi dominio del inglés técnico</CardTitle>
              <CardDescription>Resumen por knowledge component y acceso al panel completo de mastery.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="rounded-lg border bg-muted/20 p-4">
                {masteryRadar ? (
                  <MasteryRadarChart entries={masteryRadar.kcs.slice(0, 6)} size={280} />
                ) : (
                  <EmptyState
                    description="El radar aparecerá cuando existan respuestas suficientes de diagnóstico, tareas o repaso."
                    icon={GraduationCap}
                    title="Sin radar disponible"
                  />
                )}
              </div>
              <div className="grid gap-3">
                <MetricCard label="KCs dominados" value={masteryRadar ? `${masteryRadar.masteredCount}/${masteryRadar.totalKcs}` : "Sin datos"} />
                <MetricCard label="Última actualización" value={masteryRadar?.lastUpdate ? new Date(masteryRadar.lastUpdate).toLocaleDateString() : "Sin actividad"} />
                <Button asChild variant="outline">
                  <Link to={`/mastery?userId=${user.id}`}>Abrir Mi dominio</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="portfolio">
          <Card>
            <CardHeader>
              <CardTitle>Portafolio</CardTitle>
              <CardDescription>Evidencia auto-colectada de tareas, rewrites, vocabulario y pruebas finales.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {portfolio ? (
                <div className="grid gap-4 md:grid-cols-4">
                  <MetricCard label="Tareas" value={portfolio.tasksCompleted} />
                  <MetricCard label="Vocabulario" value={portfolio.vocabularySize} />
                  <MetricCard label="KCs" value={portfolio.kcMasteredCount} />
                  <MetricCard label="Rewrite" value={`${Math.round(portfolio.rewriteAcceptanceRate * 100)}%`} />
                </div>
              ) : (
                <EmptyState
                  description="El portafolio aparecerá cuando el estudiante tenga actividad suficiente."
                  icon={GraduationCap}
                  title="Sin portafolio aún"
                />
              )}
              <Button asChild variant="outline">
                <Link to={`/portfolio?userId=${user.id}`}>Abrir portafolio</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Historial de tareas TBLT</CardTitle>
              <CardDescription>Revisa tareas completadas o pendientes con su puntaje más reciente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {taskHistory.length > 0 ? (
                taskHistory.map((item) => (
                  <button
                    className="flex w-full flex-col gap-3 rounded-lg border p-4 text-left sm:flex-row sm:items-center sm:justify-between"
                    key={item.id}
                    onClick={() => navigate(`/tasks/${item.taskId}/result/${item.id}`)}
                    type="button"
                  >
                    <div className="space-y-2">
                      <p className="font-medium">{item.taskTitleEs}</p>
                      <TaskTypeBadge type={item.taskType} />
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span>Puntaje: {item.score ?? "Pendiente"}</span>
                      <span>{item.completedAt ? new Date(item.completedAt).toLocaleDateString() : "En progreso"}</span>
                    </div>
                  </button>
                ))
              ) : (
                <EmptyState
                  description="Aún no hay tareas TBLT registradas para este usuario."
                  icon={ClipboardCheck}
                  title="Sin historial de tareas"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Mi deck de vocabulario</CardTitle>
              <CardDescription>Resumen del estado actual del repaso espaciado para este estudiante.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviewStats ? (
                <div className="grid gap-4 md:grid-cols-4">
                  <MetricCard label="Cards totales" value={reviewStats.totalCards} />
                  <MetricCard label="Para hoy" value={reviewStats.dueToday} />
                  <MetricCard label="Retention" value={`${reviewStats.retentionRate}%`} />
                  <MetricCard label="Longest streak" value={`${reviewStats.longestStreak} días`} />
                </div>
              ) : (
                <EmptyState
                  description={user.englishLevel ? "No se pudo cargar el deck de vocabulario." : "Toma el diagnóstico primero para generar el deck de vocabulario."}
                  icon={GraduationCap}
                  title="Sin repaso disponible"
                />
              )}
              {user.englishLevel ? (
                <Button asChild variant="outline">
                  <Link to={`/review/deck?userId=${user.id}`}>Ver deck completo</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Historial de diagnósticos</CardTitle>
              <CardDescription>Intentos previos de placement y resultados asociados.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {history.length === 0 ? (
                <EmptyState
                  description="Este usuario todavía no ha completado diagnósticos."
                  icon={ClipboardCheck}
                  title="Sin intentos previos"
                />
              ) : (
                history.map((attempt) => (
                  <div className="rounded-lg border p-4" key={attempt.attemptId}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold">Placement: {attempt.placedLevel ?? "Pendiente"}</p>
                        <p className="text-sm text-muted-foreground">Correctas: {attempt.correctCount}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {attempt.completedAt ? new Date(attempt.completedAt).toLocaleString() : "Sin completar"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}

function InfoBlock({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 text-muted-foreground">{icon}</div>
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  )
}
