import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import {
  Users,
  Wallet,
  Package,
  LogOut,
  ChevronDown,
  User as UserIcon,
  Settings,
  Home,
  Calendar,
  EuroIcon,
} from "lucide-react";
import logo from "../assets/Klubly_Logo.png";
import { authService } from "../features/auth/services/auth.service";

const MainLayout = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentUser = authService.getCurrentUser();
  console.log("CONTENIDO REAL DEL USER EN STORAGE:", currentUser); // <--- AÑADE ESTO

  useEffect(() => {
    const closeDropdown = () => setIsProfileOpen(false);
    if (isProfileOpen) {
      globalThis.addEventListener("click", closeDropdown);
    }
    return () => globalThis.removeEventListener("click", closeDropdown);
  }, [isProfileOpen]);

  const handleLogout = () => {
    authService.logout();
  };

  const userRole = currentUser?.roleName?.replace("ROLE_", "") || "MEMBER";
  const fullName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : "Usuario";

  // Definimos todos los items posibles
  const allMenuItems = [
    {
      path: "/dashboard",
      label: "Inicio",
      icon: <Home size={20} />,
      roles: ["ADMIN", "STAFF", "MEMBER"],
    },
    {
      path: "/miembros",
      label: "Miembros",
      icon: <UserIcon size={20} />,
      roles: ["ADMIN", "STAFF"],
    },
    {
      path: "/tesoreria",
      label: "Tesorería",
      icon: <EuroIcon size={20} />,
      roles: ["ADMIN"],
    },
    {
      path: "/inventario",
      label: "Inventario",
      icon: <Package size={20} />,
      roles: ["ADMIN", "STAFF"],
    },
    {
      path: "/actividades",
      label: "Actividades",
      icon: <Calendar size={20} />,
      roles: ["ADMIN", "STAFF", "MEMBER"],
    },
    // El ADMIN ve Configuración
    {
      path: "/configuracion",
      label: "Configuración",
      icon: <Settings size={20} />,
      roles: ["ADMIN"],
    },
    {
      path: "/mispagos",
      label: "Mis Pagos",
      icon: <EuroIcon size={20} />,
      roles: ["MEMBER"],
    },
    // STAFF y MEMBER ven Mi Perfil
    {
      path: "/perfil",
      label: "Mi Perfil",
      icon: <Settings size={20} />,
      roles: ["STAFF", "MEMBER"],
    },
  ];

  // Filtramos los items según el rol del usuario actual
  const menuItems = allMenuItems.filter((item) =>
    item.roles.includes(userRole),
  );

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      {/* 1. HEADER (Ocupa todo el ancho superior) */}
      <header className="h-20 w-full bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-20">
        <div className="flex items-center">
          <img src={logo} alt="Klubly Logo" className="h-12 w-auto" />
        </div>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsProfileOpen(!isProfileOpen);
            }}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300">
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserIcon className="text-gray-500" size={24} />
              )}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold text-gray-800 leading-tight">
                {fullName}
              </p>
              <p className="text-xs font-medium text-gray-500">{userRole}</p>
            </div>
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white py-2 shadow-xl ring-1 ring-black/5 z-50">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. CONTENEDOR INFERIOR (Sidebar + Main) */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR VERTICAL */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col z-10">
          <nav className="flex-1 py-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center px-6 py-3 text-lg font-medium transition-all relative
                    ${
                      isActive
                        ? "text-indigo-600 bg-indigo-50/50"
                        : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                    }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 h-full w-1.5 bg-indigo-600" />
                  )}
                  <span
                    className={`mr-3 ${isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"}`}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* CONTENEDOR PRINCIPAL */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
