import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "./dialog"
import { cn } from "../../lib/utils"

export const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className
    )}
    data-slot="command"
    ref={ref}
    {...props}
  />
))

Command.displayName = CommandPrimitive.displayName

export function CommandDialog({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="overflow-hidden p-0">
        <DialogTitle className="sr-only">Paleta de comandos</DialogTitle>
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-group]]:pb-2 [&_[cmdk-input-wrapper]_svg]:size-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]]:text-sm">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

export function CommandInput({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>) {
  return (
    <div className="flex items-center border-b px-3" data-slot="command-input-wrapper">
      <Search className="mr-2 size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        className={cn(
          "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        data-slot="command-input"
        {...props}
      />
    </div>
  )
}

export function CommandList({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      className={cn("max-h-[24rem] overflow-y-auto overflow-x-hidden", className)}
      data-slot="command-list"
      {...props}
    />
  )
}

export function CommandEmpty(props: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      className="py-6 text-center text-sm text-muted-foreground"
      data-slot="command-empty"
      {...props}
    />
  )
}

export function CommandGroup({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>) {
  return <CommandPrimitive.Group className={cn("overflow-hidden p-1 text-foreground", className)} data-slot="command-group" {...props} />
}

export function CommandSeparator({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>) {
  return <CommandPrimitive.Separator className={cn("-mx-1 h-px bg-border", className)} data-slot="command-separator" {...props} />
}

export const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    className={cn(
      "relative flex cursor-default items-center gap-2 rounded-md px-2 py-2 text-sm outline-none select-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50",
      className
    )}
    data-slot="command-item"
    ref={ref}
    {...props}
  />
))

CommandItem.displayName = CommandPrimitive.Item.displayName

export function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("ml-auto text-xs tracking-wide text-muted-foreground", className)} data-slot="command-shortcut" {...props} />
}
