import type { User } from "../../../types"
import type { PilotEnrollment } from "../../../types/pilot"

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
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
        Todavía no hay estudiantes inscritos en esta cohorte.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-slate-500">
              <th className="px-4 py-3 font-medium">Estudiante</th>
              <th className="px-4 py-3 font-medium">Inscrito</th>
              <th className="px-4 py-3 font-medium">Pre-test</th>
              <th className="px-4 py-3 font-medium">Post-test</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
              <th className="px-4 py-3 font-medium">Última actividad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {enrollments.map((enrollment) => (
              <tr key={enrollment.id} className="align-top">
                <td className="px-4 py-4 font-medium text-slate-900">
                  {resolveUserName(enrollment.userId, users)}
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {new Date(enrollment.enrolledAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 text-slate-600">
                  <p>Diagnóstico #{enrollment.preTestDiagnosticAttemptId}</p>
                  <p>{enrollment.preTestSummativeAttemptIds.length} summatives</p>
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {enrollment.postTestDiagnosticAttemptId ? (
                    <>
                      <p>Diagnóstico #{enrollment.postTestDiagnosticAttemptId}</p>
                      <p>{enrollment.postTestSummativeAttemptIds.length} summatives</p>
                    </>
                  ) : (
                    "Pendiente"
                  )}
                </td>
                <td className="px-4 py-4 text-slate-600">{enrollment.actionsCount}</td>
                <td className="px-4 py-4 text-slate-600">{formatDate(enrollment.lastActionAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
