import { cn } from "../../lib/utils"

const buttonVariantsMap = {
  default:
    "bg-primary text-primary-foreground hover:bg-foreground/92",
  destructive:
    "bg-destructive text-destructive-foreground hover:opacity-90",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-accent",
  outline:
    "border bg-background hover:bg-accent hover:text-accent-foreground",
  ghost:
    "hover:bg-accent hover:text-accent-foreground",
  link: "text-foreground underline-offset-4 hover:underline",
} as const

const buttonSizesMap = {
  default: "h-9 px-4 py-2",
  sm: "h-8 rounded-md px-3 text-xs",
  lg: "h-10 rounded-md px-6",
  icon: "size-9",
} as const

export type ButtonSize = keyof typeof buttonSizesMap
export type ButtonVariant = keyof typeof buttonVariantsMap

export function buttonVariants({
  size = "default",
  variant = "default",
}: {
  size?: ButtonSize
  variant?: ButtonVariant
}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent text-sm font-medium shadow-none outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    buttonVariantsMap[variant],
    buttonSizesMap[size]
  )
}
