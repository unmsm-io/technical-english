import {
  BookOpen,
  Bot,
  ChartColumnIncreasing,
  ClipboardCheck,
  Files,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  Radar,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react"

export type NavItem = {
  icon: typeof LayoutDashboard
  label: string
  to: string
}

export const primaryNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Panel", to: "/" },
  { icon: BookOpen, label: "Vocabulario", to: "/vocabulary" },
  { icon: ClipboardCheck, label: "Tareas", to: "/tasks" },
  { icon: ListChecks, label: "Repaso", to: "/review/deck" },
  { icon: Radar, label: "Mi dominio", to: "/mastery" },
  { icon: GraduationCap, label: "Portafolio", to: "/portfolio" },
]

export const evaluationNavItems: NavItem[] = [
  { icon: Files, label: "Pruebas finales", to: "/summative" },
  { icon: ShieldCheck, label: "Diagnóstico", to: "/diagnostic/start" },
  { icon: Bot, label: "Perfilador", to: "/profiler" },
]

export const administrationNavItems: NavItem[] = [
  { icon: Users, label: "Usuarios", to: "/users" },
  { icon: BookOpen, label: "Contenido", to: "/content" },
]

export const adminNavItems: NavItem[] = [
  { icon: Files, label: "Items generados", to: "/admin/generated-items" },
  { icon: ChartColumnIncreasing, label: "Calibración", to: "/admin/calibration" },
  { icon: ShieldCheck, label: "Métricas verificación", to: "/admin/verification-metrics" },
  { icon: Radar, label: "Cohort analytics", to: "/admin/cohort-analytics" },
  { icon: UserRound, label: "Pilot studies", to: "/admin/pilot" },
]

export function isRouteActive(pathname: string, target: string) {
  if (target === "/") {
    return pathname === "/"
  }

  return pathname === target || pathname.startsWith(`${target}/`)
}
