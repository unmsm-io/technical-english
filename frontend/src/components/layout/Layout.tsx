import { Outlet } from "react-router"
import { CommandPalette } from "../command-palette"
import { Toaster } from "../ui/toast"
import { Breadcrumbs } from "./Breadcrumbs"
import { Header } from "./Header"

export function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main id="app-content" className="pb-12">
        <Breadcrumbs />
        <Outlet />
      </main>
      <CommandPalette />
      <Toaster />
    </div>
  )
}
