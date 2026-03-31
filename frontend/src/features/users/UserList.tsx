import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
import { Search, Plus, ChevronLeft, ChevronRight, Trash2, Pencil } from "lucide-react"
import { getUsers, searchUsers, deleteUser } from "../../api/users"
import type { User, Page } from "../../types"

export function UserList() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<Page<User> | null>(null)
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = query.trim()
        ? await searchUsers(query, page)
        : await getUsers(page)
      setUsers(data)
    } catch (err) {
      console.error("Failed to fetch users", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    fetchUsers()
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    try {
      await deleteUser(id)
      fetchUsers()
    } catch (err) {
      console.error("Failed to delete user", err)
    }
  }

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      STUDENT: "bg-green-100 text-green-700",
      TEACHER: "bg-blue-100 text-blue-700",
      ADMIN: "bg-purple-100 text-purple-700",
    }
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[role] || "bg-gray-100 text-gray-700"}`}
      >
        {role}
      </span>
    )
  }

  const levelBadge = (level: string | null) => {
    if (!level) return <span className="text-gray-400">-</span>
    const colors: Record<string, string> = {
      A1: "bg-red-100 text-red-700",
      A2: "bg-orange-100 text-orange-700",
      B1: "bg-yellow-100 text-yellow-700",
      B2: "bg-lime-100 text-lime-700",
      C1: "bg-emerald-100 text-emerald-700",
      C2: "bg-teal-100 text-teal-700",
    }
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[level] || "bg-gray-100 text-gray-700"}`}
      >
        {level}
      </span>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage students, teachers, and administrators
          </p>
        </div>
        <Link
          to="/users/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add User
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, code, or email..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              Search
            </button>
          </form>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : !users || users.content.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            No users found.{" "}
            <Link to="/users/new" className="text-blue-600 hover:underline">
              Create one
            </Link>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Faculty</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.content.map((user) => (
                  <tr
                    key={user.id}
                    className="cursor-pointer transition-colors hover:bg-gray-50"
                    onClick={() => navigate(`/users/${user.id}`)}
                  >
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">
                      {user.codigo}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">{roleBadge(user.role)}</td>
                    <td className="px-4 py-3">{levelBadge(user.englishLevel)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {user.faculty || "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/users/${user.id}/edit`)
                          }}
                          className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(user.id)
                          }}
                          className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
              <span className="text-sm text-gray-500">
                {users.totalElements} total users
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={users.first}
                  className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {users.number + 1} of {users.totalPages || 1}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={users.last}
                  className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
