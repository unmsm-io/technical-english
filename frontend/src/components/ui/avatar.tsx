import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "../../lib/utils"

export const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    className={cn("relative flex size-10 shrink-0 overflow-hidden rounded-full", className)}
    data-slot="avatar"
    ref={ref}
    {...props}
  />
))

Avatar.displayName = AvatarPrimitive.Root.displayName

export const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    className={cn("aspect-square size-full", className)}
    data-slot="avatar-image"
    ref={ref}
    {...props}
  />
))

AvatarImage.displayName = AvatarPrimitive.Image.displayName

export const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    className={cn(
      "flex size-full items-center justify-center rounded-full bg-secondary text-secondary-foreground",
      className
    )}
    data-slot="avatar-fallback"
    ref={ref}
    {...props}
  />
))

AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName
