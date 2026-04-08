import { ChevronRight } from "lucide-react"
import { Link, useLocation } from "react-router"

const segmentLabels: Record<string, string> = {
  users: "Usuarios",
  new: "Nuevo",
  edit: "Editar",
  vocabulary: "Vocabulario",
  profiler: "Perfilador",
  diagnostic: "Diagnóstico",
  tasks: "Tareas",
  start: "Inicio",
  test: "Prueba",
  result: "Resultado",
  run: "Ejecución",
  content: "Contenido",
  review: "Repaso",
  session: "Sesión",
  deck: "Deck",
  stats: "Estadísticas",
  mastery: "Mi dominio",
  kcs: "Knowledge components",
  admin: "Admin",
  calibration: "Calibración",
  "generated-items": "Items generados",
  "verification-metrics": "Métricas",
  "cohort-analytics": "Cohort Analytics",
}

export function Breadcrumbs() {
  const location = useLocation()
  const segments = location.pathname.split("/").filter(Boolean)

  if (segments.length === 0 || (segments[0] === "tasks" && segments.length > 1)) {
    return null
  }

  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`
    const label =
      segmentLabels[segment] ??
      (Number.isNaN(Number(segment)) ? segment : `ID ${segment}`)

    return { href, label }
  })

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <li>
          <Link to="/" className="transition hover:text-gray-900">
            Inicio
          </Link>
        </li>
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1
          return (
            <li key={item.href} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-gray-400" />
              {isLast ? (
                <span className="font-medium text-gray-900">{item.label}</span>
              ) : (
                <Link to={item.href} className="transition hover:text-gray-900">
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
