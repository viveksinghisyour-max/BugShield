import { Route, Routes, useNavigate } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Projects from "./pages/Projects.jsx";
import UploadProject from "./pages/UploadProject.jsx";
import ScanHistory from "./pages/ScanHistory.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";
import UserManagement from "./pages/UserManagement.jsx";
import UserActivity from "./pages/UserActivity.jsx";
import Landing from "./pages/Landing.jsx";
import { clearSession } from "./utils/auth.js";
export default function App() {
  const navigate = useNavigate();
  const logout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      {/* Public routes (guests only) */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected app routes (authenticated users only) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout onLogout={logout} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="upload" element={<UploadProject />} />
        <Route path="projects" element={<Projects />} />
        <Route path="history" element={<ScanHistory />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="users/:id" element={<UserActivity />} />
      </Route>
    </Routes>
  );
}
