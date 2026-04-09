import { EmptyState } from "../../../components/ui/empty-state"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import type { User } from "../../../types"
import type { PilotEnrollment } from "../../../types/pilot"
import { Users } from "lucide-react"

function formatDate(value: string | null) {
  if (!value) {
    return "Sin actividad"
  }
  return new Date(value).toLocaleString()
}

function resolveUserName(userId: number, users: User[]) {
  const user = users.find((item) => item.id === userId)
  if (!user) {
    return `Usuario ${userId}`
  }
  return `${user.firstName} ${user.lastName}`
}

export function EnrollmentTable({
  enrollments,
  users,
}: {
  enrollments: PilotEnrollment[]
  users: User[]
}) {
  if (enrollments.length === 0) {
    return (
      <EmptyState
        description="Todavía no hay estudiantes inscritos en esta cohorte."
        icon={Users}
        title="Sin estudiantes inscritos"
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estudiante</TableHead>
            <TableHead>Inscrito</TableHead>
            <TableHead>Pre-test</TableHead>
            <TableHead>Post-test</TableHead>
            <TableHead>Acciones</TableHead>
            <TableHead>Última actividad</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enrollment) => (
            <TableRow key={enrollment.id}>
              <TableCell className="font-medium">{resolveUserName(enrollment.userId, users)}</TableCell>
              <TableCell>{new Date(enrollment.enrolledAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <p>Diagnóstico #{enrollment.preTestDiagnosticAttemptId}</p>
                <p className="text-muted-foreground">{enrollment.preTestSummativeAttemptIds.length} summatives</p>
              </TableCell>
              <TableCell>
                {enrollment.postTestDiagnosticAttemptId ? (
                  <>
                    <p>Diagnóstico #{enrollment.postTestDiagnosticAttemptId}</p>
                    <p className="text-muted-foreground">{enrollment.postTestSummativeAttemptIds.length} summatives</p>
                  </>
                ) : (
                  "Pendiente"
                )}
              </TableCell>
              <TableCell className="tabular-nums">{enrollment.actionsCount}</TableCell>
              <TableCell>{formatDate(enrollment.lastActionAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
