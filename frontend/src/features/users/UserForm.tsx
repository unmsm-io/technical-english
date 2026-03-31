import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import { createUser, getUser, updateUser } from "../../api/users"

const createSchema = z.object({
  codigo: z.string().min(1, "Code is required").max(20),
  firstName: z.string().min(2, "Min 2 characters").max(100),
  lastName: z.string().min(2, "Min 2 characters").max(100),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]),
  faculty: z.string().optional(),
  englishLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2", ""]).optional(),
})

const updateSchema = createSchema.omit({ codigo: true, password: true })

type CreateForm = z.infer<typeof createSchema>

export function UserForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [loading, setLoading] = useState(false)
  const [fetchingUser, setFetchingUser] = useState(isEdit)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateForm>({
    resolver: zodResolver(isEdit ? (updateSchema as any) : createSchema),
    defaultValues: {
      role: "STUDENT",
      englishLevel: "",
      faculty: "",
    },
  })

  useEffect(() => {
    if (isEdit) {
      getUser(Number(id))
        .then((user) => {
          reset({
            codigo: user.codigo,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: "",
            role: user.role,
            faculty: user.faculty || "",
            englishLevel: (user.englishLevel as any) || "",
          })
        })
        .catch(() => setError("User not found"))
        .finally(() => setFetchingUser(false))
    }
  }, [id, isEdit, reset])

  const onSubmit = async (data: CreateForm) => {
    setLoading(true)
    setError(null)
    try {
      if (isEdit) {
        const { codigo, password, ...updateData } = data
        await updateUser(Number(id), {
          ...updateData,
          englishLevel: updateData.englishLevel || undefined,
          faculty: updateData.faculty || undefined,
        })
      } else {
        await createUser({
          ...data,
          englishLevel: data.englishLevel || undefined,
          faculty: data.faculty || undefined,
        })
      }
      navigate("/users")
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Something went wrong"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (fetchingUser) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={() => navigate("/users")}
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to users
      </button>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-xl font-semibold text-gray-900">
          {isEdit ? "Edit User" : "Create User"}
        </h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isEdit && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Student Code *
              </label>
              <input
                {...register("codigo")}
                placeholder="20200001"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {errors.codigo && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.codigo.message}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                First Name *
              </label>
              <input
                {...register("firstName")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Last Name *
              </label>
              <input
                {...register("lastName")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="student@unmsm.edu.pe"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {!isEdit && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                {...register("password")}
                type="password"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                {...register("role")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                English Level
              </label>
              <select
                {...register("englishLevel")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Not set</option>
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Faculty
              </label>
              <input
                {...register("faculty")}
                placeholder="FISI"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/users")}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
