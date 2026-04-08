import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"
import { cn } from "../../lib/utils"

export const HoverCard = HoverCardPrimitive.Root
export const HoverCardTrigger = HoverCardPrimitive.Trigger

export const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 8, ...props }, ref) => (
  <HoverCardPrimitive.Portal>
    <HoverCardPrimitive.Content
      align={align}
      className={cn(
        "z-50 w-80 rounded-md border bg-popover p-4 text-popover-foreground shadow-sm",
        className
      )}
      data-slot="hover-card-content"
      ref={ref}
      sideOffset={sideOffset}
      {...props}
    />
  </HoverCardPrimitive.Portal>
))

HoverCardContent.displayName = HoverCardPrimitive.Content.displayName
