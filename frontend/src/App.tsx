import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./features/auth/pages/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import ConfigurationPage from "./features/configuration/pages/ConfigurationPage";
import ProfilePage from "./features/identity/pages/ProfilePage";
import InventoryPage from "./features/inventory/pages/InventoryPage";
import TreasuryPage from "./features/treasury/pages/TreasuryPage";
import MyPaymentsPage from "./features/treasury/pages/MyPaymentsPage";
import ActivityPage from "./features/activities/pages/ActivityPage";
import DashboardPage from "./features/dashboard/pages/DashboardPage";
import UsersPage from "./features/identity/pages/UsersPage";
import RegisterPage from "./features/auth/pages/RegisterPage";

function App() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rutas Privadas (Protegidas) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/usuarios" element={<UsersPage />} />{" "}
          <Route path="/tesoreria" element={<TreasuryPage />} />
          <Route path="/inventario" element={<InventoryPage />} />
          <Route path="/actividades" element={<ActivityPage />} />
          <Route path="/configuracion" element={<ConfigurationPage />} />
          <Route path="/mi-perfil" element={<ProfilePage />} />
          <Route path="/mis-pagos" element={<MyPaymentsPage />} />
        </Route>
      </Route>

      {/* Redirección por defecto: Si no existe la ruta, al login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
