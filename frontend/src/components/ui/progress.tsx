import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "../../lib/utils"

export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)}
    data-slot="progress"
    ref={ref}
    value={value}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      data-slot="progress-indicator"
      style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))

Progress.displayName = ProgressPrimitive.Root.displayName

type ProgressRingProps = {
  className?: string
  showValue?: boolean
  size?: number
  strokeWidth?: number
  value: number
}

export function ProgressRing({
  className,
  showValue = true,
  size = 120,
  strokeWidth = 10,
  value,
}: ProgressRingProps) {
  const clampedValue = Math.max(0, Math.min(100, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clampedValue / 100) * circumference

  return (
    <div
      aria-label={`Progreso ${Math.round(clampedValue)} por ciento`}
      className={cn("relative inline-flex items-center justify-center", className)}
      data-slot="progress-ring"
      role="img"
    >
      <svg className="-rotate-90" height={size} width={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke="var(--color-foreground)"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
        />
      </svg>
      {showValue ? (
        <span className="absolute text-2xl font-semibold tracking-tight tabular-nums">
          {Math.round(clampedValue)}%
        </span>
      ) : null}
    </div>
  )
}
