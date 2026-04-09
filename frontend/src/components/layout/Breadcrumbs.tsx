import { Link, useLocation } from "react-router"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb"

const segmentLabels: Record<string, string> = {
  users: "Usuarios",
  new: "Nuevo",
  edit: "Editar",
  vocabulary: "Vocabulario",
  profiler: "Perfilador",
  diagnostic: "Diagnóstico",
  tasks: "Tareas",
  summative: "Pruebas finales",
  start: "Inicio",
  test: "Prueba",
  result: "Resultado",
  run: "Ejecución",
  content: "Contenido",
  portfolio: "Portafolio",
  review: "Repaso",
  session: "Sesión",
  deck: "Deck",
  stats: "Estadísticas",
  mastery: "Mi dominio",
  kcs: "Componentes de conocimiento",
  admin: "Admin",
  calibration: "Calibración",
  "generated-items": "Items generados",
  "verification-metrics": "Métricas de verificación",
  "cohort-analytics": "Cohort analytics",
  pilot: "Estudios piloto",
  cohorts: "Cohortes",
  results: "Resultados",
}

export function Breadcrumbs() {
  const location = useLocation()
  const segments = location.pathname.split("/").filter(Boolean)

  if (segments.length === 0) {
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
    <div className="mx-auto max-w-screen-xl px-4 pt-6 sm:px-6 lg:px-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Inicio</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1
            return (
              <BreadcrumbItem key={item.href}>
                <BreadcrumbSeparator />
                {isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
