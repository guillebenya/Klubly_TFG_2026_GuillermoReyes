import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./features/auth/pages/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import MembersPage from "./features/identity/pages/MembersPage"; // <--- 1. Importa la página

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
          {/* <--- 2. AÑADE ESTA LÍNEA */}
          <Route path="/equipos" element={<EquiposContent />} />
          {/* Añade también las otras si quieres que no te redirijan al login al pinchar */}
          <Route path="/configuracion" element={<div>Configuración</div>} />
          <Route path="/perfil" element={<div>Mi Perfil</div>} />
        </Route>
      </Route>

      {/* Redirección por defecto: Si no existe la ruta, al login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
