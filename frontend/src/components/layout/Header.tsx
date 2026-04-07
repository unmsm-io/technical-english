import { Link, useLocation } from "react-router"
import {
  BookOpen,
  Users,
  BarChart3,
  Languages,
  ScanSearch,
  ClipboardCheck,
  ListChecks,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"
import { cn } from "../../lib/utils"

const navItems = [
  { to: "/", label: "Inicio", icon: BarChart3 },
  { to: "/users", label: "Usuarios", icon: Users },
  { to: "/vocabulary", label: "Vocabulario", icon: Languages },
  { to: "/profiler", label: "Perfilador", icon: ScanSearch },
  { to: "/diagnostic/start", label: "Diagnóstico", icon: ClipboardCheck },
  { to: "/tasks", label: "Tareas", icon: ListChecks },
  { to: "/content", label: "Contenido", icon: BookOpen },
]

export function Header() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const linkClass = (active: boolean) =>
    cn(
      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
      active
        ? "bg-blue-50 text-blue-700"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    )

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">
                TechEng
              </span>
            </Link>
            <nav className="hidden gap-1 md:flex">
              {navItems.map((item) => {
                const active =
                  item.to === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.to)
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={linkClass(active)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <span className="text-sm text-gray-500">UNMSM FISI</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-700 md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileOpen ? (
          <nav className="space-y-1 border-t border-gray-200 py-3 md:hidden">
            {navItems.map((item) => {
              const active =
                item.to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={linkClass(active)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        ) : null}
      </div>
    </header>
  )
}
