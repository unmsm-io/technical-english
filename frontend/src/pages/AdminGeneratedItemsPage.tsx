import { FileText } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { getUsers } from "../api/users"
import { PageShell } from "../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Button } from "../components/ui/button"
import { EmptyState } from "../components/ui/empty-state"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { AdminApi } from "../features/admin/AdminApi"
import { GenerationForm } from "../features/admin/components/GenerationForm"
import { VerificationScoreBadge } from "../features/admin/components/VerificationScoreBadge"
import type { Page, User } from "../types"
import type { GeneratedItem, GeneratedItemState } from "../types/admin"

const tabs: { label: string; value?: GeneratedItemState }[] = [
  { label: "Pendientes", value: "PENDING_REVIEW" },
  { label: "Aprobados", value: "APPROVED" },
  { label: "Rechazados", value: "REJECTED" },
  { label: "Todos" },
]

export function AdminGeneratedItemsPage() {
  const [itemsPage, setItemsPage] = useState<Page<GeneratedItem> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeState, setActiveState] = useState<GeneratedItemState | undefined>("PENDING_REVIEW")
  const [adminUser, setAdminUser] = useState<User | null>(null)

  const loadItems = async (state = activeState) => {
    setLoading(true)
    setError(null)
    try {
      const [page, users] = await Promise.all([
        AdminApi.listGeneratedItems({ page: 0, size: 20, state }),
        getUsers(0, 100),
      ])
      setItemsPage(page)
      setAdminUser(users.content.find((user) => user.role === "ADMIN") ?? null)
    } catch {
      setError("No se pudieron cargar los items generados.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems(activeState).catch(() => {})
  }, [activeState])

  const emptyText = useMemo(() => {
    if (activeState === "PENDING_REVIEW") return "No hay items pendientes de revisión."
    if (activeState === "APPROVED") return "No hay items aprobados todavía."
    if (activeState === "REJECTED") return "No hay items rechazados todavía."
    return "No hay items generados todavía."
  }, [activeState])

  return (
    <PageShell
      subtitle="Revisión del pipeline multi-agente con aprobación y rechazo manual."
      title="Items generados"
    >
      <GenerationForm
        adminUser={adminUser}
        onSubmit={async (payload) => {
          await AdminApi.requestGeneration(payload)
          await loadItems(activeState)
        }}
      />

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.label}
            onClick={() => setActiveState(tab.value)}
            variant={tab.value === activeState || (!tab.value && !activeState) ? "default" : "outline"}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Cargando items generados...</div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Error de carga</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : itemsPage && itemsPage.content.length === 0 ? (
        <EmptyState
          description={emptyText}
          icon={FileText}
          title="Sin items"
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Pregunta</TableHead>
                <TableHead>CEFR</TableHead>
                <TableHead>Skill</TableHead>
                <TableHead>Bloom</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itemsPage?.content.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold">{item.id}</TableCell>
                  <TableCell><div className="max-w-xl">{(item.questionText ?? "Sin contenido").slice(0, 120)}</div></TableCell>
                  <TableCell>{item.targetCefrLevel}</TableCell>
                  <TableCell>{item.targetSkill}</TableCell>
                  <TableCell>{item.bloomLevel}</TableCell>
                  <TableCell><VerificationScoreBadge score={item.overallScore} /></TableCell>
                  <TableCell>{item.state}</TableCell>
                  <TableCell>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/admin/generated-items/${item.id}`}>Ver detalle</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </PageShell>
  )
}
