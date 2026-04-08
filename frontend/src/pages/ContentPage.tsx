import { BookOpen } from "lucide-react"
import { Link } from "react-router"
import { PageShell } from "../components/layout/page-shell"
import { Button } from "../components/ui/button"
import { EmptyState } from "../components/ui/empty-state"

export function ContentPage() {
  return (
    <PageShell
      subtitle="Materiales, módulos y lecciones del curso técnico."
      title="Contenido"
    >
      <EmptyState
        action={
          <>
            <Button asChild variant="outline">
              <Link to="/tasks">Ir a tareas</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/vocabulary">Explorar vocabulario</Link>
            </Button>
            <Button asChild>
              <Link to="/summative">Ver pruebas finales</Link>
            </Button>
          </>
        }
        description="Este módulo sigue en desarrollo. Mientras tanto puedes continuar con tareas, vocabulario o pruebas finales."
        icon={BookOpen}
        title="Módulo en desarrollo"
      />
    </PageShell>
  )
}
