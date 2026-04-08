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
import { SummativeListPage } from "./pages/SummativeListPage"
import { SummativeRunnerPage } from "./pages/SummativeRunnerPage"
import { SummativeResultPage } from "./pages/SummativeResultPage"
import { PortfolioPage } from "./pages/PortfolioPage"
import { ReviewSessionPage } from "./pages/ReviewSessionPage"
import { ReviewDeckPage } from "./pages/ReviewDeckPage"
import { ReviewStatsPage } from "./pages/ReviewStatsPage"
import { AdminGeneratedItemsPage } from "./pages/AdminGeneratedItemsPage"
import { AdminGeneratedItemDetailPage } from "./pages/AdminGeneratedItemDetailPage"
import { AdminCalibrationPage } from "./pages/AdminCalibrationPage"
import { AdminVerificationMetricsPage } from "./pages/AdminVerificationMetricsPage"
import { MasteryPage } from "./pages/MasteryPage"
import { MasteryKcDetailPage } from "./pages/MasteryKcDetailPage"
import { AdminCohortAnalyticsPage } from "./pages/AdminCohortAnalyticsPage"

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
        <Route path="summative" element={<SummativeListPage />} />
        <Route path="summative/:id/run" element={<SummativeRunnerPage />} />
        <Route path="summative/:id/result/:attemptId" element={<SummativeResultPage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="review/session" element={<ReviewSessionPage />} />
        <Route path="review/deck" element={<ReviewDeckPage />} />
        <Route path="review/stats" element={<ReviewStatsPage />} />
        <Route path="mastery" element={<MasteryPage />} />
        <Route path="mastery/kcs/:id" element={<MasteryKcDetailPage />} />
        <Route path="admin/generated-items" element={<AdminGeneratedItemsPage />} />
        <Route path="admin/generated-items/:id" element={<AdminGeneratedItemDetailPage />} />
        <Route path="admin/calibration" element={<AdminCalibrationPage />} />
        <Route path="admin/verification-metrics" element={<AdminVerificationMetricsPage />} />
        <Route path="admin/cohort-analytics" element={<AdminCohortAnalyticsPage />} />
      </Route>
    </Routes>
  )
}
