import { MetricCard } from "../../../components/ui/metric-card"

export function CohortMetricCard({
  hint,
  label,
  value,
}: {
  hint?: string
  label: string
  value: string
}) {
  return <MetricCard context={hint} label={label} value={value} />
}
