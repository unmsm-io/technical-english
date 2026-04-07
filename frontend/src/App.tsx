import { Routes, Route } from "react-router"
import { Layout } from "./components/layout/Layout"
import { Dashboard } from "./pages/Dashboard"
import { ContentPage } from "./pages/ContentPage"
import { UserList } from "./features/users/UserList"
import { UserForm } from "./features/users/UserForm"
import { UserProfile } from "./features/users/UserProfile"
import { VocabularyPage } from "./pages/VocabularyPage"
import { VocabularyDetailPage } from "./pages/VocabularyDetailPage"
import { ProfilerPage } from "./pages/ProfilerPage"
import { DiagnosticStartPage } from "./pages/DiagnosticStartPage"
import { DiagnosticTestPage } from "./pages/DiagnosticTestPage"
import { DiagnosticResultPage } from "./pages/DiagnosticResultPage"
import { TaskListPage } from "./pages/TaskListPage"
import { TaskDetailPage } from "./pages/TaskDetailPage"
import { TaskRunnerPage } from "./pages/TaskRunnerPage"
import { TaskResultPage } from "./pages/TaskResultPage"

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
        <Route path="vocabulary" element={<VocabularyPage />} />
        <Route path="vocabulary/:id" element={<VocabularyDetailPage />} />
        <Route path="profiler" element={<ProfilerPage />} />
        <Route path="diagnostic/start" element={<DiagnosticStartPage />} />
        <Route path="diagnostic/test" element={<DiagnosticTestPage />} />
        <Route path="diagnostic/result" element={<DiagnosticResultPage />} />
        <Route path="tasks" element={<TaskListPage />} />
        <Route path="tasks/:id" element={<TaskDetailPage />} />
        <Route path="tasks/:id/run" element={<TaskRunnerPage />} />
        <Route path="tasks/:id/result/:attemptId" element={<TaskResultPage />} />
      </Route>
    </Routes>
  )
}
