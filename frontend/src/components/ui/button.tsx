import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "../../lib/utils"
import {
  buttonVariants,
  type ButtonSize,
  type ButtonVariant,
} from "./button-variants"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  size?: ButtonSize
  variant?: ButtonVariant
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild = false,
      className,
      size = "default",
      type = "button",
      variant = "default",
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(
          buttonVariants({ size, variant }),
          className
        )}
        data-slot="button"
        ref={ref}
        type={type}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"
