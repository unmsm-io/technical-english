import { LaptopMinimal, Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

const themes = [
  { icon: Sun, label: "Claro", value: "light" },
  { icon: Moon, label: "Oscuro", value: "dark" },
  { icon: LaptopMinimal, label: "Sistema", value: "system" },
] as const

export function ThemeToggle() {
  const { resolvedTheme, setTheme, theme } = useTheme()
  const ActiveIcon =
    theme === "system"
      ? LaptopMinimal
      : resolvedTheme === "dark"
        ? Moon
        : Sun

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label="Cambiar tema" size="icon" variant="ghost">
          <ActiveIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map(({ icon: Icon, label, value }) => (
          <DropdownMenuItem key={value} onClick={() => setTheme(value)}>
            <Icon className="mr-2 size-4" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
