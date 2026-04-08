import type { TaskType } from "../../../types/task"
import { Badge } from "../../../components/ui/badge"

const taskTypeLabels: Record<TaskType, string> = {
  ERROR_MESSAGE: "Mensaje de error",
  API_DOC: "Documentación API",
  COMMIT_MSG: "Commit",
  PR_DESC: "Pull request",
  CODE_REVIEW: "Code review",
  TECH_REPORT: "Reporte técnico",
}

interface TaskTypeBadgeProps {
  type: TaskType
}

export function TaskTypeBadge({ type }: TaskTypeBadgeProps) {
  return <Badge variant="secondary">{taskTypeLabels[type]}</Badge>
}
