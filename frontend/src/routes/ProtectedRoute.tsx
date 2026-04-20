import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  console.log("DEBUG - ProtectedRoute: ¿Hay token?", !!token);

  // Si no hay token, redirigimos al login
  if (!token) {
    console.warn("DEBUG - ProtectedRoute: No hay token, redirigiendo...")
    return <Navigate to="/login" replace />;
  }

  // Si hay token, permitimos el paso a las rutas hijas (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;