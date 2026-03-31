import { Link, useLocation } from "react-router"
import { BookOpen, Users, BarChart3 } from "lucide-react"
import { cn } from "../../lib/utils"

const navItems = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/users", label: "Users", icon: Users },
  { to: "/content", label: "Content", icon: BookOpen },
]

export function Header() {
  const location = useLocation()

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
            <nav className="flex gap-1">
              {navItems.map((item) => {
                const active =
                  item.to === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.to)
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">UNMSM FISI</span>
          </div>
        </div>
      </div>
    </header>
  )
}
