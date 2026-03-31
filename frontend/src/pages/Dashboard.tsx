import { useEffect, useState } from "react"
import { Link } from "react-router"
import { Users, BookOpen, Brain, BarChart3 } from "lucide-react"
import { getUsers } from "../api/users"

export function Dashboard() {
  const [userCount, setUserCount] = useState(0)

  useEffect(() => {
    getUsers(0, 1)
      .then((data) => setUserCount(data.totalElements))
      .catch(() => {})
  }, [])

  const stats = [
    { label: "Users", value: userCount, icon: Users, href: "/users", color: "bg-blue-500" },
    { label: "Modules", value: 0, icon: BookOpen, href: "/content", color: "bg-green-500" },
    { label: "Exercises", value: 0, icon: Brain, href: "#", color: "bg-purple-500" },
    { label: "Completions", value: 0, icon: BarChart3, href: "#", color: "bg-orange-500" },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Technical English Learning Platform - UNMSM FISI
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            Quick Actions
          </h2>
          <div className="space-y-2">
            <Link
              to="/users/new"
              className="block rounded-lg border border-gray-200 p-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              Register a new student
            </Link>
            <Link
              to="/content"
              className="block rounded-lg border border-gray-200 p-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              Browse course content
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-gray-900">
            About the Platform
          </h2>
          <p className="text-sm leading-relaxed text-gray-600">
            Sistema de recomendacion para el Aprendizaje de Ingles Tecnico
            Basico para Profesionales de Ciencias e Ingenieria. Built with
            Spring Boot microservices and LLM integration.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Spring Boot", "React", "PostgreSQL", "LLM"].map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
