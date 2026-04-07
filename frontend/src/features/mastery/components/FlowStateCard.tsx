import { Activity, AlertTriangle, BatteryWarning, MoonStar, Sparkles } from "lucide-react"
import type { FlowState } from "../../../types/mastery"

interface FlowStateCardProps {
  flowState: FlowState
}

const stateConfig: Record<
  FlowState["state"],
  {
    icon: typeof Sparkles
    containerClass: string
    badgeClass: string
    label: string
  }
> = {
  FLOW: {
    icon: Sparkles,
    containerClass: "border-emerald-200 bg-emerald-50",
    badgeClass: "bg-emerald-600 text-white",
    label: "Flow",
  },
  FRUSTRATION: {
    icon: AlertTriangle,
    containerClass: "border-rose-200 bg-rose-50",
    badgeClass: "bg-rose-600 text-white",
    label: "Frustración",
  },
  BOREDOM: {
    icon: BatteryWarning,
    containerClass: "border-amber-200 bg-amber-50",
    badgeClass: "bg-amber-500 text-slate-950",
    label: "Aburrimiento",
  },
  INACTIVE: {
    icon: MoonStar,
    containerClass: "border-slate-200 bg-slate-50",
    badgeClass: "bg-slate-700 text-white",
    label: "Inactivo",
  },
  NEUTRAL: {
    icon: Activity,
    containerClass: "border-blue-200 bg-blue-50",
    badgeClass: "bg-blue-600 text-white",
    label: "Neutral",
  },
}

export function FlowStateCard({ flowState }: FlowStateCardProps) {
  const config = stateConfig[flowState.state]
  const Icon = config.icon

  return (
    <section className={`rounded-3xl border p-5 shadow-sm ${config.containerClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
              <Icon className="h-5 w-5 text-slate-900" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Estado de flow</p>
              <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${config.badgeClass}`}>
                {config.label}
              </span>
            </div>
          </div>
          <p className="text-sm leading-6 text-slate-700">{flowState.messageEs}</p>
        </div>
        <div className="rounded-2xl bg-white/80 px-3 py-2 text-right shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">24h</p>
          <p className="text-sm font-semibold text-slate-950">
            {flowState.recent24hAttemptCount} intentos
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <MetricChip
          label="Acierto reciente"
          value={`${Math.round(flowState.recent24hCorrectRate * 100)}%`}
        />
        <MetricChip label="AGAIN seguidos" value={`${flowState.consecutiveAgains}`} />
        <MetricChip label="EASY seguidos" value={`${flowState.consecutiveEasys}`} />
      </div>

      <div className="mt-5 rounded-2xl bg-white/80 p-4 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-slate-500">Recomendación</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{flowState.recommendation}</p>
      </div>
    </section>
  )
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  )
}
