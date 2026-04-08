import { ArrowRight, BookOpen, ClipboardCheck, Layers3, ListChecks, Radar, Sparkles, Users } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { getDashboardStats } from "../api/analytics"
import { getUsers } from "../api/users"
import { PageShell } from "../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { MetricCard } from "../components/ui/metric-card"
import { EmptyState } from "../components/ui/empty-state"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { AdminApi } from "../features/admin/AdminApi"
import { CohortApi } from "../features/cohort/CohortApi"
import { MasteryApi } from "../features/mastery/MasteryApi"
import { PilotApi } from "../features/pilot/PilotApi"
import { PortfolioApi } from "../features/portfolio/PortfolioApi"
import { ReviewApi } from "../features/review/ReviewApi"
import { TaskApi } from "../features/task/TaskApi"
import type { DashboardStats as DashboardStatsType } from "../types/diagnostic"
import type { VerificationMetrics } from "../types/admin"
import type { User, ReviewStats, TaskStats, CohortMasteryResponse, MasteryRadarResponse } from "../types"
import type { PilotCohort } from "../types/pilot"
import type { PortfolioResponse } from "../types/portfolio"

export function Dashboard() {
  const [statsData, setStatsData] = useState<DashboardStatsType | null>(null)
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null)
  const [taskReadyUser, setTaskReadyUser] = useState<User | null>(null)
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null)
  const [verificationMetrics, setVerificationMetrics] = useState<VerificationMetrics | null>(null)
  const [masteryRadar, setMasteryRadar] = useState<MasteryRadarResponse | null>(null)
  const [cohortMastery, setCohortMastery] = useState<CohortMasteryResponse | null>(null)
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioResponse | null>(null)
  const [pilotCohorts, setPilotCohorts] = useState<PilotCohort[]>([])
  const [hasAdmin, setHasAdmin] = useState(false)

  useEffect(() => {
    getDashboardStats().then(setStatsData).catch(() => {})
    TaskApi.getStats().then(setTaskStats).catch(() => {})
    AdminApi.getMetrics().then(setVerificationMetrics).catch(() => {})

    getUsers(0, 100)
      .then((page) => {
        const readyUser = page.content.find((user) => Boolean(user.englishLevel)) ?? null
        const adminAvailable = page.content.some((user) => user.role === "ADMIN")
        setTaskReadyUser(readyUser)
        setHasAdmin(adminAvailable)

        if (readyUser) {
          ReviewApi.getStats(readyUser.id).then(setReviewStats).catch(() => {})
          MasteryApi.getStudentMasteryRadar(readyUser.id).then(setMasteryRadar).catch(() => {})
          PortfolioApi.getCurrent(readyUser.id).then(setPortfolioSummary).catch(() => {})
        }

        if (adminAvailable) {
          CohortApi.getMastery().then(setCohortMastery).catch(() => {})
          PilotApi.listCohorts().then(setPilotCohorts).catch(() => {})
        }
      })
      .catch(() => {})
  }, [])

  const vocabularyTotal = useMemo(
    () =>
      Object.values(statsData?.vocabularyByLayer ?? {}).reduce(
        (total, current) => total + current,
        0
      ),
    [statsData]
  )

  const stats = [
    {
      context: "Estudiantes, docentes y administradores registrados",
      delta: `${statsData?.diagnosticsCompleted ?? 0} diagnósticos`,
      href: "/users",
      label: "Usuarios activos",
      trend: "up" as const,
      value: statsData?.totalUsers ?? 0,
    },
    {
      context: "Inventario consolidado entre GSL, AWL, EEWL y CSAWL",
      delta: `${Object.keys(statsData?.vocabularyByLayer ?? {}).length} capas`,
      href: "/vocabulary",
      label: "Vocabulario total",
      trend: "flat" as const,
      value: vocabularyTotal,
    },
    {
      context: "Pruebas de ubicación cerradas para el piloto",
      delta: `${Math.round(statsData?.averageVocabularySize ?? 0)} promedio`,
      href: "/diagnostic/start",
      label: "Diagnósticos completos",
      trend: "up" as const,
      value: statsData?.diagnosticsCompleted ?? 0,
    },
    {
      context: "Catálogo TBLT listo para ejecutar",
      delta: `${reviewStats?.dueToday ?? 0} por repasar hoy`,
      href: "/tasks",
      label: "Tareas disponibles",
      trend: "flat" as const,
      value: taskStats?.totalTasks ?? 0,
    },
  ]

  const quickActions = [
    { icon: Users, label: "Registrar estudiante", to: "/users/new" },
    { icon: ClipboardCheck, label: "Tomar diagnóstico", to: "/diagnostic/start" },
    { icon: BookOpen, label: "Explorar vocabulario", to: "/vocabulary" },
    taskReadyUser
      ? { icon: ListChecks, label: "Comenzar tarea de mi nivel", to: `/tasks?userId=${taskReadyUser.id}` }
      : null,
    taskReadyUser
      ? { icon: Radar, label: "Abrir sesión de repaso", to: `/review/session?userId=${taskReadyUser.id}` }
      : null,
  ].filter(Boolean) as Array<{ icon: typeof Users; label: string; to: string }>

  return (
    <PageShell
      subtitle="Vista general del sistema"
      title="Panel principal"
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.href}>
            <MetricCard
              context={stat.context}
              delta={stat.delta}
              label={stat.label}
              trend={stat.trend}
              value={stat.value}
            />
          </Link>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Acciones rápidas</CardTitle>
            <CardDescription>Atajos principales para moverte por el producto.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <Link
                className="flex items-center justify-between rounded-md border px-4 py-3 text-sm hover:bg-accent"
                key={action.to}
                to={action.to}
              >
                <span className="flex items-center gap-3">
                  <action.icon className="size-4 text-muted-foreground" />
                  {action.label}
                </span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Capas de vocabulario</CardTitle>
            <CardDescription>Distribución actual del contenido técnico disponible.</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(statsData?.vocabularyByLayer ?? {}).length === 0 ? (
              <EmptyState
                description="Todavía no hay capas de vocabulario para mostrar en el panel."
                icon={Layers3}
                title="Sin capas registradas"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Capa</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(statsData?.vocabularyByLayer ?? {}).map(([layer, total]) => (
                    <TableRow key={layer}>
                      <TableCell className="font-medium">{layer}</TableCell>
                      <TableCell className="text-right tabular-nums">{total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Portafolio reciente</CardTitle>
            <CardDescription>Resumen de avance del estudiante activo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {portfolioSummary && taskReadyUser ? (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <MetricCard label="Tareas" trend="up" value={portfolioSummary.tasksCompleted} />
                  <MetricCard label="Vocabulario" trend="flat" value={portfolioSummary.vocabularySize} />
                  <MetricCard label="Pruebas aprobadas" trend="up" value={portfolioSummary.summativeTestsPassed} />
                </div>
                <Alert>
                  <AlertTitle>{taskReadyUser.firstName} {taskReadyUser.lastName}</AlertTitle>
                  <AlertDescription>
                    Tiene {portfolioSummary.tasksCompleted} tareas registradas, {portfolioSummary.vocabularySize} términos activos y {portfolioSummary.summativeTestsPassed} pruebas finales superadas.
                  </AlertDescription>
                </Alert>
                <Button asChild>
                  <Link to={`/portfolio?userId=${taskReadyUser.id}`}>Abrir portafolio</Link>
                </Button>
              </>
            ) : (
              <EmptyState
                description="Selecciona o activa un estudiante con datos para abrir su resumen de portafolio."
                icon={Sparkles}
                title="Sin portafolio disponible"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado del dominio</CardTitle>
            <CardDescription>Lectura rápida de repaso y mastery.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetricCard label="Repaso hoy" trend="flat" value={reviewStats?.dueToday ?? 0} />
            <MetricCard label="Retención" trend="up" value={`${reviewStats?.retentionRate ?? 0}%`} />
            <MetricCard label="KCs dominados" trend="up" value={masteryRadar?.masteredCount ?? 0} />
          </CardContent>
        </Card>
      </section>

      {hasAdmin ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Verificación y revisión</CardTitle>
              <CardDescription>Indicadores de pipeline editorial y revisión humana.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <MetricCard label="Pendientes" trend="flat" value={verificationMetrics?.pendingCount ?? 0} />
              <MetricCard label="Cohortes activas" trend="up" value={pilotCohorts.filter((cohort) => cohort.state !== "ARCHIVED").length} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analítica de cohortes</CardTitle>
              <CardDescription>Vista resumida del bloque administrativo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MetricCard label="Cobertura mastery" trend="up" value={cohortMastery?.distributions.length ?? 0} />
              <Button asChild variant="outline">
                <Link to="/admin/pilot">Abrir estudios piloto</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      ) : null}
    </PageShell>
  )
}
