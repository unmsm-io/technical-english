import { BookOpen, ChevronDown, Search, Settings, UserRound, LogOut } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, NavLink, useLocation } from "react-router"
import { getUser } from "../../api/users"
import type { User } from "../../types"
import { cn } from "../../lib/utils"
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
import { Kbd } from "../ui/kbd"
import { MobileNav } from "./MobileNav"
import {
  adminNavItems,
  administrationNavItems,
  evaluationNavItems,
  isRouteActive,
  primaryNavItems,
} from "./navigation"

function buildUserLink(user: User | null, suffix = "") {
  if (!user) {
    return "/users"
  }

  return suffix ? `/users/${user.id}/${suffix}` : `/users/${user.id}`
}

function HeaderLogo() {
  return (
    <Link className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" to="/">
      <div className="flex size-8 items-center justify-center rounded-md border border-border bg-card shadow-sm">
        <div className="size-5 rounded-[0.4rem] border border-foreground/15 bg-foreground/5" />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold tracking-tight">TechEng</span>
        <span className="hidden text-sm text-muted-foreground sm:inline">technical-english</span>
      </div>
    </Link>
  )
}

export function Header() {
  const location = useLocation()
  const pathname = location.pathname
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const rawUserId = Number(params.get("userId") ?? "")

    if (!rawUserId) {
      setCurrentUser(null)
      return
    }

    getUser(rawUserId).then(setCurrentUser).catch(() => setCurrentUser(null))
  }, [location.search])

  const showAdmin = currentUser?.role === "ADMIN"

  const moreNavItems = useMemo(
    () => ({
      admin: showAdmin ? adminNavItems : [],
      administration: administrationNavItems,
      evaluation: evaluationNavItems,
    }),
    [showAdmin]
  )

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2"
        href="#app-content"
      >
        Saltar al contenido
      </a>

      <div className="mx-auto flex h-12 max-w-screen-2xl items-center justify-between gap-3 px-4 sm:px-6 md:h-14 lg:px-8">
        <div className="flex min-w-0 items-center gap-4 md:gap-6">
          <HeaderLogo />

          <nav aria-label="Navegación principal" className="hidden items-center gap-1 md:flex">
            {primaryNavItems.map((item) => (
              <NavLink
                aria-current={isRouteActive(pathname, item.to) ? "page" : undefined}
                className={({ isActive }) =>
                  cn(
                    "inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    (isActive || isRouteActive(pathname, item.to)) && "text-foreground"
                  )
                }
                end={item.to === "/"}
                key={item.to}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-9 rounded-full px-3 text-sm font-medium text-muted-foreground" size="sm" variant="ghost">
                  Más
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>Evaluación</DropdownMenuLabel>
                {moreNavItems.evaluation.map((item) => (
                  <DropdownMenuItem asChild key={item.to}>
                    <Link className="flex items-center gap-2" to={item.to}>
                      <item.icon className="size-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Administración</DropdownMenuLabel>
                {moreNavItems.administration.map((item) => (
                  <DropdownMenuItem asChild key={item.to}>
                    <Link className="flex items-center gap-2" to={item.to}>
                      <item.icon className="size-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                {moreNavItems.admin.length > 0 ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Admin</DropdownMenuLabel>
                    {moreNavItems.admin.map((item) => (
                      <DropdownMenuItem asChild key={item.to}>
                        <Link className="flex items-center gap-2" to={item.to}>
                          <item.icon className="size-4" />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            aria-label="Abrir paleta de comandos"
            className="h-9 gap-2 rounded-full px-2.5 sm:px-3"
            onClick={() => window.dispatchEvent(new Event("command-palette:open"))}
            size="sm"
            variant="ghost"
          >
            <Search className="size-4" />
            <span className="hidden text-sm text-muted-foreground lg:inline">Buscar</span>
            <Kbd className="hidden lg:inline-flex">⌘K</Kbd>
          </Button>

          <Button
            aria-label="Abrir glosario de siglas y conceptos"
            className="h-9 gap-2 rounded-full px-2.5 sm:px-3"
            onClick={() => window.dispatchEvent(new Event("glossary:open"))}
            size="sm"
            variant="ghost"
          >
            <BookOpen className="size-4" />
            <span className="hidden text-sm text-muted-foreground lg:inline">Glosario</span>
            <Kbd className="hidden lg:inline-flex">⌘/</Kbd>
          </Button>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label="Abrir menú de usuario" className="h-9 rounded-full px-2" size="sm" variant="ghost">
                <Avatar className="size-7 border border-border">
                  <AvatarFallback className="text-xs font-semibold">
                    {currentUser?.firstName?.[0] ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="space-y-0.5">
                <div className="font-medium text-foreground">
                  {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Usuario actual"}
                </div>
                <div className="text-xs font-normal text-muted-foreground">
                  {currentUser?.email ?? "Sin usuario seleccionado"}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link className="flex items-center gap-2" to={buildUserLink(currentUser)}>
                  <UserRound className="size-4" />
                  Mi perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link className="flex items-center gap-2" to={buildUserLink(currentUser, "edit")}>
                  <Settings className="size-4" />
                  Configuración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2">
                <LogOut className="size-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <MobileNav currentUser={currentUser} pathname={pathname} showAdmin={showAdmin} />
        </div>
      </div>
    </header>
  )
}
