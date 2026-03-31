import { useEffect, useState } from "react"
import { useNavigate, useParams, Link } from "react-router"
import { ArrowLeft, Pencil, Trash2, Loader2, Mail, GraduationCap, Building, Calendar } from "lucide-react"
import { getUser, deleteUser } from "../../api/users"
import type { User } from "../../types"

export function UserProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getUser(Number(id))
      .then(setUser)
      .catch(() => setError("User not found"))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user?")) return
    try {
      await deleteUser(Number(id))
      navigate("/users")
    } catch {
      setError("Failed to delete user")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">{error || "User not found"}</p>
        <Link to="/users" className="mt-2 text-sm text-blue-600 hover:underline">
          Back to users
        </Link>
      </div>
    )
  }

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      STUDENT: "bg-green-100 text-green-700",
      TEACHER: "bg-blue-100 text-blue-700",
      ADMIN: "bg-purple-100 text-purple-700",
    }
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${colors[role]}`}>
        {role}
      </span>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate("/users")}
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to users
      </button>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-start justify-between border-b border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-semibold text-blue-700">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-sm text-gray-500 font-mono">{user.codigo}</p>
              <div className="mt-1">{roleBadge(user.role)}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/users/${user.id}/edit`)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 p-6">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">Email</p>
              <p className="text-sm text-gray-900">{user.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <GraduationCap className="mt-0.5 h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">English Level</p>
              <p className="text-sm text-gray-900">{user.englishLevel || "Not set"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Building className="mt-0.5 h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">Faculty</p>
              <p className="text-sm text-gray-900">{user.faculty || "Not set"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">Joined</p>
              <p className="text-sm text-gray-900">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
