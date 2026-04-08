import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
import { deleteUser, getUsers, searchUsers } from "../../api/users"
import { PageShell } from "../../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { EmptyState } from "../../components/ui/empty-state"
import { Input } from "../../components/ui/input"
import { Skeleton } from "../../components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { CefrBadge } from "../vocabulary/components/CefrBadge"
import type { Page, User } from "../../types"

export function UserList() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<Page<User> | null>(null)
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = query.trim() ? await searchUsers(query, page) : await getUsers(page)
      setUsers(data)
    } catch {
      setError("No se pudo cargar la lista de usuarios.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page])

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return
    try {
      await deleteUser(id)
      fetchUsers()
    } catch {
      setError("No se pudo eliminar el usuario.")
    }
  }

  return (
    <PageShell
      actions={
        <Button asChild>
          <Link to="/users/new">
            <Plus className="size-4" />
            Nuevo usuario
          </Link>
        </Button>
      }
      subtitle="Gestiona estudiantes, docentes y administradores."
      title="Usuarios"
    >
      <Card>
        <CardContent className="grid gap-4 pt-6 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre, código o email..."
              value={query}
            />
          </div>
          <Button onClick={() => {
            setPage(0)
            fetchUsers()
          }} variant="outline">
            Buscar
          </Button>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Error de carga</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton className="h-16 w-full" key={index} />
              ))}
            </div>
          ) : !users || users.content.length === 0 ? (
            <div className="p-6">
              <EmptyState
                action={
                  <Button asChild>
                    <Link to="/users/new">Crear usuario</Link>
                  </Button>
                }
                description="Prueba otra búsqueda o registra al primer estudiante."
                icon={Users}
                title="No se encontraron usuarios"
              />
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Nivel</TableHead>
                      <TableHead>Facultad</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.content.map((user) => (
                      <TableRow className="cursor-pointer" key={user.id} onClick={() => navigate(`/users/${user.id}`)}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9">
                              <AvatarFallback>
                                {user.firstName[0]}
                                {user.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.firstName} {user.lastName}</div>
                              <div className="text-xs text-muted-foreground">{user.active ? "Activo" : "Inactivo"}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{user.codigo}</TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                        <TableCell>{user.englishLevel ? <CefrBadge level={user.englishLevel as never} /> : <span className="text-muted-foreground">-</span>}</TableCell>
                        <TableCell className="text-muted-foreground">{user.faculty || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              onClick={(event) => {
                                event.stopPropagation()
                                navigate(`/users/${user.id}/edit`)
                              }}
                              size="icon"
                              variant="ghost"
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              onClick={(event) => {
                                event.stopPropagation()
                                handleDelete(user.id)
                              }}
                              size="icon"
                              variant="ghost"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="grid gap-4 p-4 md:hidden">
                {users.content.map((user) => (
                  <button
                    className="rounded-lg border p-4 text-left"
                    key={user.id}
                    onClick={() => navigate(`/users/${user.id}`)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10">
                          <AvatarFallback>
                            {user.firstName[0]}
                            {user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="font-mono text-xs text-muted-foreground">{user.codigo}</div>
                        </div>
                      </div>
                      <Badge variant="outline">{user.role}</Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{user.email}</p>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between border-t px-4 py-3">
                <span className="text-sm text-muted-foreground">{users.totalElements} usuarios</span>
                <div className="flex items-center gap-2">
                  <Button disabled={users.first} onClick={() => setPage((current) => Math.max(0, current - 1))} variant="outline">
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {users.number + 1} de {users.totalPages || 1}
                  </span>
                  <Button disabled={users.last} onClick={() => setPage((current) => current + 1)} variant="outline">
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </PageShell>
  )
}
