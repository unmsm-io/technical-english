import { Routes, Route } from "react-router"
import { Layout } from "./components/layout/Layout"
import { Dashboard } from "./pages/Dashboard"
import { ContentPage } from "./pages/ContentPage"
import { UserList } from "./features/users/UserList"
import { UserForm } from "./features/users/UserForm"
import { UserProfile } from "./features/users/UserProfile"

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UserList />} />
        <Route path="users/new" element={<UserForm />} />
        <Route path="users/:id" element={<UserProfile />} />
        <Route path="users/:id/edit" element={<UserForm />} />
        <Route path="content" element={<ContentPage />} />
      </Route>
    </Routes>
  )
}
