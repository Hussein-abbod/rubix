import { Routes, Route, Navigate } from "react-router-dom";
import { Landing } from "./pages/public/Landing";
import { SignInPage } from "./pages/public/SignIn";
import { SignUpPage } from "./pages/public/SignUp";
import { CreateProject } from "./pages/CreateProject";
import { DocumentEditor } from "./pages/DocumentEditor";
import { Dashboard } from "./pages/Dashboard";
import { KanbanBoard } from "./pages/KanbanBoard";
import { TaskDistribution } from "./pages/TaskDistribution";
import { TeamManagement } from "./pages/TeamManagement";
import { Integrations } from "./pages/Integrations";
import { ProjectSettings } from "./pages/ProjectSettings";
import { UserSettings } from "./pages/UserSettings";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects/new" element={<CreateProject />} />
      <Route path="/projects/:id/board" element={<KanbanBoard />} />
      <Route path="/projects/:id/tasks" element={<TaskDistribution />} />
      <Route path="/projects/:id/team" element={<TeamManagement />} />
      <Route path="/projects/:id/integrations" element={<Integrations />} />
      <Route path="/projects/:id/settings" element={<ProjectSettings />} />
      <Route path="/projects/:id/editor" element={<DocumentEditor />} />
      <Route path="/settings" element={<UserSettings />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
