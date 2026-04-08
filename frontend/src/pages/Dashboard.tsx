import { useEffect, useState } from "react"
import { Link } from "react-router"
import { Users, Languages, ClipboardCheck, BarChart3, ListChecks } from "lucide-react"
import { getDashboardStats } from "../api/analytics"
import { getUsers } from "../api/users"
import { ReviewApi } from "../features/review/ReviewApi"
import { TaskApi } from "../features/task/TaskApi"
import { AdminApi } from "../features/admin/AdminApi"
import { MasteryApi } from "../features/mastery/MasteryApi"
import { CohortApi } from "../features/cohort/CohortApi"
import { PortfolioApi } from "../features/portfolio/PortfolioApi"
import { PilotApi } from "../features/pilot/PilotApi"
import type { DashboardStats as DashboardStatsType } from "../types/diagnostic"
import type { ReviewStats, TaskStats, User } from "../types"
import type { VerificationMetrics } from "../types/admin"
import type { CohortMasteryResponse, MasteryRadarResponse } from "../types"
import type { PortfolioResponse } from "../types/portfolio"
import type { PilotCohort } from "../types/pilot"

export function Dashboard() {
  const [statsData, setStatsData] = useState<DashboardStatsType | null>(null)
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null)
  const [taskReadyUser, setTaskReadyUser] = useState<User | null>(null)
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null)
  const [verificationMetrics, setVerificationMetrics] =
    useState<VerificationMetrics | null>(null)
  const [masteryRadar, setMasteryRadar] = useState<MasteryRadarResponse | null>(null)
  const [cohortMastery, setCohortMastery] = useState<CohortMasteryResponse | null>(null)
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioResponse | null>(null)
  const [pilotCohorts, setPilotCohorts] = useState<PilotCohort[]>([])
  const [hasAdmin, setHasAdmin] = useState(false)

  useEffect(() => {
    getDashboardStats()
      .then(setStatsData)
      .catch(() => {})

    TaskApi.getStats()
      .then(setTaskStats)
      .catch(() => {})

    AdminApi.getMetrics()
      .then(setVerificationMetrics)
      .catch(() => {})

    getUsers(0, 100)
      .then((page) => {
        const readyUser = page.content.find((user) => Boolean(user.englishLevel)) ?? null
        setTaskReadyUser(readyUser)
        const adminAvailable = page.content.some((user) => user.role === "ADMIN")
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

  const vocabularyTotal = Object.values(statsData?.vocabularyByLayer ?? {}).reduce(
    (total, current) => total + current,
    0
  )

  const stats = [
    {
      label: "Usuarios activos",
      value: statsData?.totalUsers ?? 0,
      icon: Users,
      href: "/users",
      color: "bg-blue-500",
    },
    {
      label: "Vocabulario total",
      value: vocabularyTotal,
      icon: Languages,
      href: "/vocabulary",
      color: "bg-emerald-500",
    },
    {
      label: "Diagnósticos completos",
      value: statsData?.diagnosticsCompleted ?? 0,
      icon: ClipboardCheck,
      href: "/diagnostic/start",
      color: "bg-violet-500",
    },
    {
      label: "Promedio vocabular",
      value: Math.round(statsData?.averageVocabularySize ?? 0),
      icon: BarChart3,
      href: "/users",
      color: "bg-amber-500",
    },
    {
      label: "Cards para repasar hoy",
      value: reviewStats?.dueToday ?? 0,
      icon: BarChart3,
      href: taskReadyUser ? `/review/session?userId=${taskReadyUser.id}` : "/review/session",
      color: "bg-rose-500",
    },
    {
      label: "Tareas TBLT disponibles",
      value: taskStats?.totalTasks ?? 0,
      icon: ListChecks,
      href: "/tasks",
      color: "bg-slate-500",
    },
    {
      label: "Items pendientes de revisión",
      value: verificationMetrics?.pendingCount ?? 0,
      icon: ClipboardCheck,
      href: "/admin/generated-items",
      color: "bg-indigo-500",
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Plataforma de ingles tecnico para UNMSM FISI
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-7">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.href}
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className={`rounded-lg ${stat.color} p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-gray-900">
            Acciones rápidas
          </h2>
          <div className="space-y-2">
            <Link
              to="/users/new"
              className="block rounded-lg border border-gray-200 p-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              Registrar un nuevo estudiante
            </Link>
            <Link
              to="/diagnostic/start"
              className="block rounded-lg border border-gray-200 p-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              Tomar diagnóstico
            </Link>
            <Link
              to="/vocabulary"
              className="block rounded-lg border border-gray-200 p-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              Explorar vocabulario
            </Link>
            {taskReadyUser ? (
              <Link
                to={`/tasks?userId=${taskReadyUser.id}`}
                className="block rounded-lg border border-gray-200 p-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                Empezar tarea de mi nivel
              </Link>
            ) : null}
            {taskReadyUser ? (
              <Link
                to={`/review/session?userId=${taskReadyUser.id}`}
                className="block rounded-lg border border-gray-200 p-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                Comenzar repaso
              </Link>
            ) : null}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-gray-900">
            Capas de vocabulario
          </h2>
          <div className="space-y-3 text-sm text-gray-600">
            {Object.entries(statsData?.vocabularyByLayer ?? {}).map(([layer, total]) => (
              <div key={layer} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                <span>{layer}</span>
                <span className="font-semibold text-gray-900">{total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {portfolioSummary && taskReadyUser ? (
        <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-medium text-emerald-950">Widget de portafolio</h2>
              <p className="mt-2 text-sm text-emerald-800">
                {taskReadyUser.firstName} acumula {portfolioSummary.tasksCompleted} tareas,
                {` `}{portfolioSummary.vocabularySize} términos activos y
                {` `}{portfolioSummary.summativeTestsPassed} pruebas finales aprobadas.
              </p>
            </div>
            <Link
              to={`/portfolio?userId=${taskReadyUser.id}`}
              className="inline-flex rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800"
            >
              Abrir portafolio
            </Link>
          </div>
        </div>
      ) : null}

      {reviewStats && taskReadyUser ? (
        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-6">
          <h2 className="text-lg font-medium text-blue-950">Última preparación de repaso</h2>
          <p className="mt-2 text-sm text-blue-800">
            {taskReadyUser.firstName} tiene {reviewStats.dueToday} cards para hoy y una retención reciente de{" "}
            {reviewStats.retentionRate}%.
          </p>
        </div>
      ) : null}

      {hasAdmin ? (
        <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-medium text-amber-950">Pilot studies activos</h2>
              <p className="mt-2 text-sm text-amber-800">
                Hay {pilotCohorts.filter((cohort) => cohort.state !== "ARCHIVED").length} cohortes
                activas y {pilotCohorts.filter((cohort) => cohort.state === "RESULTS_AVAILABLE").length}
                {` `}listas para reporte.
              </p>
            </div>
            <Link
              to="/admin/pilot"
              className="inline-flex rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-800"
            >
              Abrir piloto
            </Link>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium text-slate-900">Widget de mastery</h2>
              <p className="mt-1 text-sm text-slate-500">
                Resumen rápido del dominio técnico del estudiante activo.
              </p>
            </div>
            <Link
              to={taskReadyUser ? `/mastery?userId=${taskReadyUser.id}` : "/mastery"}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Abrir
            </Link>
          </div>
          {masteryRadar && taskReadyUser ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">{taskReadyUser.firstName}</p>
                <p className="mt-1 text-3xl font-semibold text-slate-950">
                  {masteryRadar.masteredCount}/{masteryRadar.totalKcs}
                </p>
                <p className="mt-1 text-sm text-slate-500">knowledge components dominados</p>
              </div>
              <div className="space-y-3">
                {masteryRadar.kcs.slice(0, 3).map((entry) => (
                  <div key={entry.kcId} className="rounded-2xl border border-slate-200 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-slate-900">{entry.kcNameEs}</span>
                      <span className="text-sm font-semibold text-slate-700">
                        {Math.round(entry.pLearned * 100)}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${Math.max(4, Math.round(entry.pLearned * 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-500">
              Aún no hay un estudiante listo para mostrar mastery.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium text-slate-900">Widget de cohorte</h2>
              <p className="mt-1 text-sm text-slate-500">
                Resumen agregado reservado para administradores.
              </p>
            </div>
            <Link
              to="/admin/cohort-analytics"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Abrir
            </Link>
          </div>
          {hasAdmin && cohortMastery ? (
            <div className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Usuarios analizados</p>
                  <p className="mt-1 text-3xl font-semibold text-slate-950">
                    {cohortMastery.userCount}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">KCs trazados</p>
                  <p className="mt-1 text-3xl font-semibold text-slate-950">
                    {cohortMastery.distributions.length}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {cohortMastery.distributions.slice(0, 3).map((distribution) => (
                  <div key={distribution.kcId} className="rounded-2xl border border-slate-200 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-slate-900">
                        {distribution.kcNameEs}
                      </span>
                      <span className="text-sm text-slate-600">
                        {distribution.masteredCount} dominados
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-500">
              Este widget se habilita cuando existe al menos un usuario administrador.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
