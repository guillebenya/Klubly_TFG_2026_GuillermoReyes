import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./features/auth/pages/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./layouts/MainLayout"; // 1. Importamos el Layout

// 2. Definimos componentes temporales para que no salga el error en rojo
// Más adelante estos irán en sus propios archivos en features/dashboard y features/teams
const DashboardContent = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-xl font-bold text-gray-800">Bienvenido al Panel de Control</h2>
    <p className="text-gray-500 mt-2">Aquí verás el resumen de tu club en el futuro.</p>
  </div>
);

const EquiposContent = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-xl font-bold text-gray-800">Gestión de Equipos</h2>
    <p className="text-gray-500 mt-2">Listado y edición de los equipos del club.</p>
  </div>
);

function App() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas Privadas (Protegidas) */}
      <Route element={<ProtectedRoute />}>
        {/* Envolvemos las rutas privadas con el Layout principal */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardContent />} />
          <Route path="/equipos" element={<EquiposContent />} />
        </Route>
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;