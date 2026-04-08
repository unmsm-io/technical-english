import { BookOpen, ChevronDown, Command, GraduationCap, Languages, LayoutDashboard, Menu, Radar, Shield, UserCircle2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, useLocation, useNavigate, useSearchParams } from "react-router"
import { getUsers } from "../../api/users"
import type { User } from "../../types"
import { ThemeToggle } from "../theme-toggle"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Input } from "../ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet"
import { cn } from "../../lib/utils"

const primaryNav = [
  { label: "Panel", to: "/", icon: LayoutDashboard },
  { label: "Vocabulario", to: "/vocabulary", icon: Languages },
  { label: "Tareas", to: "/tasks", icon: BookOpen },
  { label: "Repaso", to: "/review/deck", icon: Command },
  { label: "Mi dominio", to: "/mastery", icon: Radar },
  { label: "Portafolio", to: "/portfolio", icon: GraduationCap },
] as const

const secondaryNav = [
  { label: "Pruebas finales", to: "/summative" },
  { label: "Perfilador", to: "/profiler" },
  { label: "Diagnóstico", to: "/diagnostic/start" },
  { label: "Usuarios", to: "/users" },
  { label: "Contenido", to: "/content" },
] as const

const adminNav = [
  { label: "Items generados", to: "/admin/generated-items" },
  { label: "Calibración", to: "/admin/calibration" },
  { label: "Métricas de verificación", to: "/admin/verification-metrics" },
  { label: "Analítica de cohortes", to: "/admin/cohort-analytics" },
  { label: "Estudios piloto", to: "/admin/pilot" },
] as const

function isActivePath(pathname: string, to: string) {
  return to === "/" ? pathname === "/" : pathname.startsWith(to)
}

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [users, setUsers] = useState<User[]>([])
  const [showAdmin, setShowAdmin] = useState(false)
  const selectedUserId = Number(searchParams.get("userId") ?? "") || null

  useEffect(() => {
    getUsers(0, 100)
      .then((page) => {
        setUsers(page.content)
        setShowAdmin(page.content.some((user) => user.role === "ADMIN"))
      })
      .catch(() => {
        setUsers([])
        setShowAdmin(false)
      })
  }, [])

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users]
  )

  const handleUserChange = (value: string) => {
    const nextParams = new URLSearchParams(searchParams)
    if (value) {
      nextParams.set("userId", value)
    } else {
      nextParams.delete("userId")
    }
    setSearchParams(nextParams, { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2"
        href="#app-content"
      >
        Saltar al contenido
      </a>
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link className="flex items-center gap-2" to="/">
            <div className="flex size-8 items-center justify-center rounded-md border bg-card">
              <BookOpen className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight">TechEng</span>
              <span className="text-[11px] text-muted-foreground">technical-english</span>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {primaryNav.map((item) => (
              <Link
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  isActivePath(location.pathname, item.to) && "bg-accent text-foreground"
                )}
                key={item.to}
                to={item.to}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  Más
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {secondaryNav.map((item) => (
                  <DropdownMenuItem key={item.to} onClick={() => navigate(item.to)}>
                    {item.label}
                  </DropdownMenuItem>
                ))}
                {showAdmin ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Admin</DropdownMenuLabel>
                    {adminNav.map((item) => (
                      <DropdownMenuItem key={item.to} onClick={() => navigate(item.to)}>
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <Button
            aria-label="Abrir paleta de comandos"
            onClick={() => window.dispatchEvent(new Event("command-palette:open"))}
            size="sm"
            variant="outline"
          >
            <Command className="size-4" />
            Cmd+K
          </Button>
          <div className="w-56">
            <Input
              aria-label="Usuario activo"
              list="header-user-options"
              onChange={(event) => {
                const nextUser = users.find((user) => {
                  const fullName = `${user.firstName} ${user.lastName}`
                  return fullName === event.target.value
                })
                handleUserChange(nextUser ? String(nextUser.id) : "")
              }}
              placeholder="Usuario activo"
              value={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : ""}
            />
            <datalist id="header-user-options">
              {users.map((user) => (
                <option key={user.id} value={`${user.firstName} ${user.lastName}`} />
              ))}
            </datalist>
          </div>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2" size="icon" variant="ghost">
                <Avatar className="size-8">
                  <AvatarFallback>
                    <UserCircle2 className="size-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones rápidas</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate("/users/new")}>Nuevo usuario</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/users")}>Ver usuarios</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button aria-label="Abrir navegación móvil" size="icon" variant="ghost">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Navegación</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-2">
                {[...primaryNav, ...secondaryNav, ...(showAdmin ? adminNav : [])].map((item) => (
                  <Link
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      isActivePath(location.pathname, item.to) && "bg-accent text-foreground"
                    )}
                    key={item.to}
                    to={item.to}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-6 space-y-2">
                <Button
                  className="w-full justify-start"
                  onClick={() => window.dispatchEvent(new Event("command-palette:open"))}
                  variant="outline"
                >
                  <Command className="size-4" />
                  Abrir comandos
                </Button>
                <Button className="w-full justify-start" onClick={() => navigate("/users/new")} variant="ghost">
                  <Shield className="size-4" />
                  Crear usuario
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
