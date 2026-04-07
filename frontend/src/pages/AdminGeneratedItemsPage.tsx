import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { getUsers } from "../api/users"
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
  const [activeState, setActiveState] = useState<GeneratedItemState | undefined>(
    "PENDING_REVIEW"
  )
  const [adminUser, setAdminUser] = useState<User | null>(null)

  const loadItems = async (state = activeState) => {
    setLoading(true)
    setError(null)
    try {
      const [page, users] = await Promise.all([
        AdminApi.listGeneratedItems({ state, page: 0, size: 20 }),
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
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Items generados</h1>
        <p className="text-sm text-gray-600">
          Revisa el pipeline multi-agente, aprueba items útiles y rechaza los que no
          cumplan.
        </p>
      </div>

      <GenerationForm
        adminUser={adminUser}
        onSubmit={async (payload) => {
          await AdminApi.requestGeneration(payload)
          await loadItems(activeState)
        }}
      />

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = tab.value === activeState || (!tab.value && !activeState)
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActiveState(tab.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                active
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500 shadow-sm">
          Cargando items generados...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700 shadow-sm">
          {error}
        </div>
      ) : itemsPage && itemsPage.content.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500 shadow-sm">
          {emptyText}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Pregunta</th>
                  <th className="px-4 py-3">CEFR</th>
                  <th className="px-4 py-3">Skill</th>
                  <th className="px-4 py-3">Bloom</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {itemsPage?.content.map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="px-4 py-3 font-semibold text-gray-900">{item.id}</td>
                    <td className="px-4 py-3 text-gray-700">
                      <div className="max-w-xl">
                        {(item.questionText ?? "Sin contenido").slice(0, 120)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.targetCefrLevel}</td>
                    <td className="px-4 py-3 text-gray-600">{item.targetSkill}</td>
                    <td className="px-4 py-3 text-gray-600">{item.bloomLevel}</td>
                    <td className="px-4 py-3">
                      <VerificationScoreBadge score={item.overallScore} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.state}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/generated-items/${item.id}`}
                        className="inline-flex rounded-lg border border-gray-200 px-3 py-1.5 font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
