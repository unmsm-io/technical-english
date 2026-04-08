import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert"
import type { FlowState } from "../../../types/mastery"

interface FlowStateCardProps {
  flowState: FlowState
}

export function FlowStateCard({ flowState }: FlowStateCardProps) {
  return (
    <Alert>
      <AlertTitle>Estado de flow: {flowState.state}</AlertTitle>
      <AlertDescription>
        {flowState.messageEs}
        {" "}
        {flowState.recommendation}
        {" "}
        Últimas 24h: {flowState.recent24hAttemptCount} intentos, {Math.round(flowState.recent24hCorrectRate * 100)}% de acierto.
      </AlertDescription>
    </Alert>
  )
}
