import type { TaskType } from "../../../types/task"

const taskTypeClasses: Record<TaskType, string> = {
  ERROR_MESSAGE: "bg-red-100 text-red-800",
  API_DOC: "bg-blue-100 text-blue-800",
  COMMIT_MSG: "bg-purple-100 text-purple-800",
  PR_DESC: "bg-green-100 text-green-800",
  CODE_REVIEW: "bg-amber-100 text-amber-800",
  TECH_REPORT: "bg-slate-100 text-slate-800",
}

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
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${taskTypeClasses[type]}`}
    >
      {taskTypeLabels[type]}
    </span>
  )
}
