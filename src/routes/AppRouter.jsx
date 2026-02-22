import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import LoginPage from "../pages/LoginPage";
import CallbackPage from "../pages/CallbackPage";
import DashboardPage from "../pages/DashboardPage";
import ContactsPage from "../pages/ContactsPage";
import ContactDetailPage from "../pages/ContactDetailPage";
import PipelinePage from "../pages/PipelinePage";
import TasksPage from "../pages/TasksPage";
import SettingsPage from "../pages/SettingsPage";
import NotFoundPage from "../pages/NotFoundPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/callback" element={<CallbackPage />} />

        {/* Protected routes with layout */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<ErrorBoundary module="Dashboard"><DashboardPage /></ErrorBoundary>} />
          <Route path="/contactos" element={<ErrorBoundary module="Contactos"><ContactsPage /></ErrorBoundary>} />
          <Route path="/contactos/:id" element={<ErrorBoundary module="Detalle de contacto"><ContactDetailPage /></ErrorBoundary>} />
          <Route path="/pipeline" element={<ErrorBoundary module="Pipeline"><PipelinePage /></ErrorBoundary>} />
          <Route path="/tareas" element={<ErrorBoundary module="Tareas"><TasksPage /></ErrorBoundary>} />
          <Route path="/configuracion" element={<ErrorBoundary module="Configuración"><SettingsPage /></ErrorBoundary>} />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
