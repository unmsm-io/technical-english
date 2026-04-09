import { Plus, Search, UserPlus, WandSparkles } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { getVocabulary } from "../features/vocabulary/VocabularyApi"
import { cn } from "../lib/utils"
import {
  adminNavItems,
  administrationNavItems,
  evaluationNavItems,
  primaryNavItems,
} from "./layout/navigation"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "./ui/command"
import { useTheme } from "./theme-provider"

const staticCommands = [
  ...primaryNavItems.map((item) => ({ group: "Navegación", label: item.label, path: item.to })),
  ...evaluationNavItems.map((item) => ({ group: "Evaluación", label: item.label, path: item.to })),
  ...administrationNavItems.map((item) => ({ group: "Administración", label: item.label, path: item.to })),
  ...adminNavItems.map((item) => ({ group: "Admin", label: item.label, path: item.to })),
] as const

export function CommandPalette() {
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [searchHits, setSearchHits] = useState<Array<{ id: number; term: string }>>([])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }

    const handleOpen = () => setOpen(true)

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("command-palette:open", handleOpen as EventListener)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("command-palette:open", handleOpen as EventListener)
    }
  }, [])

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSearchHits([])
      return
    }

    const timeoutId = window.setTimeout(() => {
      getVocabulary({ page: 0, q: query.trim(), size: 5 })
        .then((response) => {
          setSearchHits(response.content.map((item) => ({ id: item.id, term: item.term })))
        })
        .catch(() => setSearchHits([]))
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [query])

  const groupedCommands = useMemo(() => {
    return staticCommands.reduce<Record<string, Array<(typeof staticCommands)[number]>>>((acc, command) => {
      acc[command.group] ??= []
      acc[command.group].push(command)
      return acc
    }, {})
  }, [])

  const handleNavigate = (path: string) => {
    setOpen(false)
    navigate(path)
  }

  return (
    <CommandDialog onOpenChange={setOpen} open={open}>
      <CommandInput
        onValueChange={setQuery}
        placeholder="Busca rutas, términos o acciones..."
        value={query}
      />
      <CommandList>
        <CommandEmpty>Sin resultados para esa búsqueda.</CommandEmpty>
        {Object.entries(groupedCommands).map(([group, commands]) => (
          <CommandGroup heading={group} key={group}>
            {commands.map((command) => (
              <CommandItem key={command.path} onSelect={() => handleNavigate(command.path)}>
                <Search className="size-4" />
                <span>{command.label}</span>
                <CommandShortcut>{command.path}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
        <CommandSeparator />
        <CommandGroup heading="Tema">
          <CommandItem onSelect={() => setTheme("light")}>
            <span>Claro</span>
          </CommandItem>
          <CommandItem onSelect={() => setTheme("dark")}>
            <span>Oscuro</span>
          </CommandItem>
          <CommandItem onSelect={() => setTheme("system")}>
            <span>Sistema</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Acciones">
          <CommandItem onSelect={() => handleNavigate("/users/new")}>
            <UserPlus className="size-4" />
            <span>Crear usuario</span>
            <CommandShortcut>Nuevo</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate("/tasks")}>
            <WandSparkles className="size-4" />
            <span>Comenzar tarea aleatoria</span>
            <CommandShortcut>Tareas</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate("/diagnostic/start")}>
            <Search className="size-4" />
            <span>Tomar diagnóstico</span>
            <CommandShortcut>Inicio</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        {searchHits.length > 0 ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Vocabulario">
              {searchHits.map((item) => (
                <CommandItem key={item.id} onSelect={() => handleNavigate(`/vocabulary/${item.id}`)}>
                  <Plus className={cn("size-4 opacity-60")} />
                  <span>{item.term}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}
      </CommandList>
    </CommandDialog>
  )
}
