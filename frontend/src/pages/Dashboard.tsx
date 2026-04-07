import { useEffect, useState } from "react"
import { Link } from "react-router"
import { Users, Languages, ClipboardCheck, BarChart3, ListChecks } from "lucide-react"
import { getDashboardStats } from "../api/analytics"
import { getUsers } from "../api/users"
import { TaskApi } from "../features/task/TaskApi"
import type { DashboardStats as DashboardStatsType } from "../types/diagnostic"
import type { TaskStats, User } from "../types"

export function Dashboard() {
  const [statsData, setStatsData] = useState<DashboardStatsType | null>(null)
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null)
  const [taskReadyUser, setTaskReadyUser] = useState<User | null>(null)

  useEffect(() => {
    getDashboardStats()
      .then(setStatsData)
      .catch(() => {})

    TaskApi.getStats()
      .then(setTaskStats)
      .catch(() => {})

    getUsers(0, 100)
      .then((page) => {
        setTaskReadyUser(page.content.find((user) => Boolean(user.englishLevel)) ?? null)
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
      label: "Tareas TBLT disponibles",
      value: taskStats?.totalTasks ?? 0,
      icon: ListChecks,
      href: "/tasks",
      color: "bg-slate-500",
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
    </div>
  )
}
