import { ChevronRight, LogOut, Menu, Search, Settings, UserRound } from "lucide-react"
import { NavLink } from "react-router"
import type { User } from "../../types"
import { cn } from "../../lib/utils"
import { ThemeToggle } from "../theme-toggle"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Button } from "../ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet"
import { Kbd } from "../ui/kbd"
import {
  adminNavItems,
  administrationNavItems,
  evaluationNavItems,
  isRouteActive,
  primaryNavItems,
  type NavItem,
} from "./navigation"

type MobileNavProps = {
  currentUser: User | null
  pathname: string
  showAdmin: boolean
}

function MobileNavSection({ items, pathname, title }: { items: NavItem[]; pathname: string; title: string }) {
  return (
    <section className="space-y-2">
      <p className="px-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </p>
      <div className="space-y-1">
        {items.map((item) => (
          <NavLink
            aria-current={isRouteActive(pathname, item.to) ? "page" : undefined}
            className={({ isActive }) =>
              cn(
                "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                (isActive || isRouteActive(pathname, item.to)) && "bg-accent text-foreground"
              )
            }
            key={item.to}
            to={item.to}
          >
            <span className="flex items-center gap-3">
              <item.icon className="size-4" />
              {item.label}
            </span>
            <ChevronRight className="size-4 opacity-50" />
          </NavLink>
        ))}
      </div>
    </section>
  )
}

export function MobileNav({ currentUser, pathname, showAdmin }: MobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button aria-label="Abrir navegación" className="h-9 w-9 md:hidden" size="icon" variant="ghost">
          <Menu className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col gap-6 px-4 py-4 sm:px-5" side="right">
        <SheetHeader className="pr-8">
          <SheetTitle className="text-base">Navegación</SheetTitle>
          <SheetDescription>
            Accesos principales del producto y utilidades del espacio actual.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto pr-1">
          <Button
            className="h-10 w-full justify-between rounded-lg"
            onClick={() => window.dispatchEvent(new Event("command-palette:open"))}
            variant="outline"
          >
            <span className="flex items-center gap-2">
              <Search className="size-4" />
              Buscar
            </span>
            <Kbd>⌘K</Kbd>
          </Button>

          <MobileNavSection items={primaryNavItems} pathname={pathname} title="Principal" />
          <MobileNavSection items={evaluationNavItems} pathname={pathname} title="Evaluación" />
          <MobileNavSection items={administrationNavItems} pathname={pathname} title="Administración" />
          {showAdmin ? <MobileNavSection items={adminNavItems} pathname={pathname} title="Admin" /> : null}
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="size-9 border border-border">
                <AvatarFallback className="text-xs font-semibold">
                  {currentUser?.firstName?.[0] ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "Usuario actual"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {currentUser?.email ?? "Selecciona un usuario desde una vista con contexto"}
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button asChild className="justify-start" variant="ghost">
              <NavLink to={currentUser ? `/users/${currentUser.id}` : "/users"}>
                <UserRound className="size-4" />
                Mi perfil
              </NavLink>
            </Button>
            <Button asChild className="justify-start" variant="ghost">
              <NavLink to={currentUser ? `/users/${currentUser.id}/edit` : "/users"}>
                <Settings className="size-4" />
                Configuración
              </NavLink>
            </Button>
            <Button className="col-span-2 justify-start" variant="ghost">
              <LogOut className="size-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
