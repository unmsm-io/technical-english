import { Loader2, PlayCircle } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { getUsers } from "../api/users"
import { PageShell } from "../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { startDiagnostic } from "../features/diagnostic/DiagnosticApi"
import { useDiagnosticStore } from "../features/diagnostic/diagnosticStore"
import type { User } from "../types"

export function DiagnosticStartPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const selectedUserId = useDiagnosticStore((state) => state.selectedUserId)
  const setSelectedUserId = useDiagnosticStore((state) => state.setSelectedUserId)
  const startAttempt = useDiagnosticStore((state) => state.startAttempt)
  const reset = useDiagnosticStore((state) => state.reset)

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getUsers(0, 100)
      .then((page) => {
        setUsers(page.content)
        const queryUserId = Number(searchParams.get("userId"))
        if (queryUserId) {
          setSelectedUserId(queryUserId)
        }
      })
      .catch(() => setError("No se pudo cargar la lista de usuarios."))
      .finally(() => setLoading(false))
  }, [searchParams, setSelectedUserId])

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users]
  )

  const handleStart = async () => {
    if (!selectedUserId) {
      setError("Selecciona un usuario antes de comenzar.")
      return
    }

    setStarting(true)
    setError(null)

    try {
      reset()
      setSelectedUserId(selectedUserId)
      const payload = await startDiagnostic(selectedUserId)
      startAttempt(payload)
      navigate("/diagnostic/test")
    } catch {
      setError("No se pudo iniciar el diagnóstico.")
    } finally {
      setStarting(false)
    }
  }

  return (
    <PageShell
      subtitle="Ubica al estudiante entre A1 y C1 con lectura, vocabulario y gramática aplicada a contextos de ingeniería."
      title="Test diagnóstico"
    >
      <Card>
        <CardHeader>
          <CardTitle>Preparación</CardTitle>
          <CardDescription>Selecciona al estudiante y revisa lo que evaluará la prueba.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              Cargando usuarios...
            </div>
          ) : (
            <>
              <div className="max-w-sm space-y-2">
                <label className="text-sm font-medium">Usuario</label>
                <Select
                  onValueChange={(value) => setSelectedUserId(value === "none" ? null : Number(value))}
                  value={selectedUserId ? String(selectedUserId) : "none"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Selecciona un usuario</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.firstName} {user.lastName} · {user.codigo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium">Duración estimada</p>
                    <p className="mt-2 text-sm text-muted-foreground">8 a 10 minutos</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium">Cobertura</p>
                    <p className="mt-2 text-sm text-muted-foreground">Lectura, vocabulario y gramática</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium">Resultado</p>
                    <p className="mt-2 text-sm text-muted-foreground">Placement CEFR y tamaño vocabular estimado</p>
                  </CardContent>
                </Card>
              </div>

              {selectedUser ? (
                <Alert>
                  <AlertTitle>Estudiante seleccionado</AlertTitle>
                  <AlertDescription>
                    El diagnóstico se registrará para {selectedUser.firstName} {selectedUser.lastName}.
                  </AlertDescription>
                </Alert>
              ) : null}

              {error ? (
                <Alert variant="destructive">
                  <AlertTitle>No se pudo continuar</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              <div className="flex justify-end">
                <Button disabled={!selectedUserId || starting} onClick={handleStart} size="lg">
                  {starting ? <Loader2 className="size-4 animate-spin" /> : <PlayCircle className="size-4" />}
                  Comenzar prueba
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </PageShell>
  )
}
