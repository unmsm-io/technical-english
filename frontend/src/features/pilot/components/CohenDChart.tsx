import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import type { PilotMetricEntry } from "../../../types/pilot"

function normalize(value: number | null) {
  if (value === null) {
    return 0
  }
  return Math.max(Math.min(Math.abs(value), 2), 0)
}

export function CohenDChart({ metrics }: { metrics: PilotMetricEntry }) {
  const bars = [
    { key: "vocabulary", label: "Vocabulario", value: metrics.vocabularyCohenD },
    { key: "comprehension", label: "Comprensión", value: metrics.comprehensionCohenD },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tamaño de efecto</CardTitle>
        <CardDescription>Referencia rápida de Cohen&apos;s d para vocabulario y comprensión.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <svg className="min-w-[320px]" viewBox="0 0 420 220">
          <line stroke="var(--color-border)" x1="48" x2="390" y1="180" y2="180" />
          <line stroke="var(--color-border)" x1="48" x2="48" y1="30" y2="180" />
          {[0.2, 0.5, 0.8, 1.2, 1.6, 2.0].map((tick, index) => {
            const y = 180 - (tick / 2) * 140
            return (
              <g key={tick}>
                <line stroke="var(--color-muted)" x1="42" x2="390" y1={y} y2={y} />
                <text className="fill-muted-foreground text-[11px]" x="10" y={y + 4}>
                  {index === 5 ? "2.0+" : tick.toFixed(1)}
                </text>
              </g>
            )
          })}
          {bars.map((bar, index) => {
            const height = (normalize(bar.value) / 2) * 140
            const x = 110 + index * 130
            const y = 180 - height
            return (
              <g key={bar.key}>
                <rect fill="var(--color-foreground)" height={height} rx="18" width="58" x={x} y={y} />
                <text className="fill-muted-foreground text-[12px]" textAnchor="middle" x={x + 29} y="202">
                  {bar.label}
                </text>
                <text className="fill-foreground text-[13px] font-semibold" textAnchor="middle" x={x + 29} y={Math.max(y - 10, 22)}>
                  {bar.value === null ? "N/D" : bar.value.toFixed(2)}
                </text>
              </g>
            )
          })}
        </svg>
      </CardContent>
    </Card>
  )
}
