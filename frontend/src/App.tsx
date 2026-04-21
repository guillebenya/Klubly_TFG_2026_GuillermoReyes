import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./features/auth/pages/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import MembersPage from "./features/identity/pages/MembersPage";
import ConfigurationPage from "./features/configuration/pages/ConfigurationPage";
import ProfilePage from "./features/identity/pages/ProfilePage";

const DashboardContent = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-xl font-bold text-gray-800">
      Bienvenido al Panel de Control
    </h2>
    <p className="text-gray-500 mt-2">
      Aquí verás el resumen de tu club en el futuro.
    </p>
  </div>
);

// Puedes quitar EquiposContent si ya vas a usar MembersPage o dejarlo para más tarde
const EquiposContent = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-xl font-bold text-gray-800">Gestión de Equipos</h2>
    <p className="text-gray-500 mt-2">
      Listado y edición de los equipos del club.
    </p>
  </div>
);

function App() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas Privadas (Protegidas) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardContent />} />
          <Route path="/miembros" element={<MembersPage />} />{" "}
          <Route path="/equipos" element={<EquiposContent />} />
          <Route path="/configuracion" element={<ConfigurationPage />} />
          <Route path="/mi-perfil" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Redirección por defecto: Si no existe la ruta, al login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
