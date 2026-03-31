import { api } from "./client"
import type {
  ApiResponse,
  Page,
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from "../types"

export async function getUsers(page = 0, size = 20) {
  const { data } = await api.get<ApiResponse<Page<User>>>("/users", {
    params: { page, size },
  })
  return data.data
}

export async function searchUsers(query: string, page = 0, size = 20) {
  const { data } = await api.get<ApiResponse<Page<User>>>("/users/search", {
    params: { q: query, page, size },
  })
  return data.data
}

export async function getUser(id: number) {
  const { data } = await api.get<ApiResponse<User>>(`/users/${id}`)
  return data.data
}

export async function createUser(request: CreateUserRequest) {
  const { data } = await api.post<ApiResponse<User>>("/users", request)
  return data.data
}

export async function updateUser(id: number, request: UpdateUserRequest) {
  const { data } = await api.put<ApiResponse<User>>(`/users/${id}`, request)
  return data.data
}

export async function deleteUser(id: number) {
  await api.delete(`/users/${id}`)
}
