import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate, useParams } from "react-router"
import { z } from "zod"
import { createUser, getUser, updateUser } from "../../api/users"
import { PageShell } from "../../components/layout/page-shell"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"

const formSchema = z.object({
  codigo: z.string().max(20).optional(),
  email: z.string().email("Correo inválido"),
  englishLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2", ""]).optional(),
  faculty: z.string().optional(),
  firstName: z.string().min(2, "Mínimo 2 caracteres").max(100),
  lastName: z.string().min(2, "Mínimo 2 caracteres").max(100),
  password: z.string().optional(),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]),
})

type FormValues = z.infer<typeof formSchema>

export function UserForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(false)
  const [fetchingUser, setFetchingUser] = useState(isEdit)
  const [error, setError] = useState<string | null>(null)

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      codigo: "",
      email: "",
      englishLevel: "",
      faculty: "",
      firstName: "",
      lastName: "",
      password: "",
      role: "STUDENT",
    },
    resolver: zodResolver(formSchema),
  })

  useEffect(() => {
    if (!isEdit) return

    getUser(Number(id))
      .then((user) => {
        reset({
          codigo: user.codigo,
          email: user.email,
          englishLevel: (user.englishLevel as FormValues["englishLevel"]) ?? "",
          faculty: user.faculty || "",
          firstName: user.firstName,
          lastName: user.lastName,
          password: "",
          role: user.role,
        })
      })
      .catch(() => setError("No se pudo cargar el usuario."))
      .finally(() => setFetchingUser(false))
  }, [id, isEdit, reset])

  const onSubmit = async (data: FormValues) => {
    if (!isEdit) {
      if (!data.codigo?.trim()) {
        setError("El código es obligatorio.")
        return
      }
      if (!data.password || data.password.length < 8) {
        setError("La contraseña debe tener al menos 8 caracteres.")
        return
      }
    }

    setLoading(true)
    setError(null)
    try {
      if (isEdit) {
        await updateUser(Number(id), {
          email: data.email,
          englishLevel: data.englishLevel || undefined,
          faculty: data.faculty || undefined,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
        })
      } else {
        await createUser({
          codigo: data.codigo ?? "",
          email: data.email,
          englishLevel: data.englishLevel || undefined,
          faculty: data.faculty || undefined,
          firstName: data.firstName,
          lastName: data.lastName,
          password: data.password ?? "",
          role: data.role,
        })
      }
      navigate("/users")
    } catch {
      setError("No se pudo guardar el usuario.")
    } finally {
      setLoading(false)
    }
  }

  if (fetchingUser) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  return (
    <PageShell
      actions={
        <Button onClick={() => navigate("/users")} variant="outline">
          <ArrowLeft className="size-4" />
          Volver
        </Button>
      }
      subtitle={isEdit ? "Actualiza datos personales, académicos y credenciales." : "Crea una nueva cuenta para estudiantes, docentes o administradores."}
      title={isEdit ? "Editar usuario" : "Nuevo usuario"}
    >
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>No se pudo guardar</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 xl:grid-cols-2">
          {!isEdit ? (
            <Card>
              <CardHeader>
                <CardTitle>Credenciales</CardTitle>
                <CardDescription>Información para acceso inicial al sistema.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código</Label>
                  <Input id="codigo" placeholder="20200001" {...register("codigo")} />
                  {errors.codigo ? <p className="text-xs text-destructive">{errors.codigo.message}</p> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" type="password" {...register("password")} />
                  {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Información personal</CardTitle>
              <CardDescription>Nombre, correo y datos de contacto académico.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input id="firstName" {...register("firstName")} />
                  {errors.firstName ? <p className="text-xs text-destructive">{errors.firstName.message}</p> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input id="lastName" {...register("lastName")} />
                  {errors.lastName ? <p className="text-xs text-destructive">{errors.lastName.message}</p> : null}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Perfil académico</CardTitle>
            <CardDescription>Rol, nivel CEFR y facultad del usuario.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select onValueChange={(value) => setValue("role", value as FormValues["role"])} value={watch("role")}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Estudiante</SelectItem>
                  <SelectItem value="TEACHER">Docente</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nivel CEFR</Label>
              <Select
                onValueChange={(value) => setValue("englishLevel", value === "none" ? "" : (value as FormValues["englishLevel"]))}
                value={watch("englishLevel") || "none"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin nivel</SelectItem>
                  <SelectItem value="A1">A1</SelectItem>
                  <SelectItem value="A2">A2</SelectItem>
                  <SelectItem value="B1">B1</SelectItem>
                  <SelectItem value="B2">B2</SelectItem>
                  <SelectItem value="C1">C1</SelectItem>
                  <SelectItem value="C2">C2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="faculty">Facultad</Label>
              <Input id="faculty" placeholder="FISI" {...register("faculty")} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button onClick={() => navigate("/users")} type="button" variant="outline">
            Cancelar
          </Button>
          <Button disabled={loading} type="submit">
            {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear usuario"}
          </Button>
        </div>
      </form>
    </PageShell>
  )
}
