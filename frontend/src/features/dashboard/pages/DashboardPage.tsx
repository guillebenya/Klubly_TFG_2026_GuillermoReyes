import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Wallet, 
  Package, 
  Calendar, 
  ArrowRight, 
  UserPlus, 
  TrendingUp, 
  ClipboardList,
  UserCircle
} from "lucide-react";

// Componentes Compartidos
import Card from "../../../components/shared/Card";
import SummaryCard from "../../../components/shared/SummaryCard";
import PageHeader from "../../../components/shared/PageHeader";

// Servicios
import { authService } from "../../auth/services/auth.service";
import { userService } from "../../identity/services/user.service";
import { treasuryService } from "../../treasury/services/treasury.service";
import { activityService } from "../../activities/services/activity.service";

const DashboardPage = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.roleName === "ADMIN";
  const isStaff = currentUser?.roleName === "STAFF";
  const isMember = currentUser?.roleName === "MEMBER";

  // --- ESTADOS PARA DATOS RÁPIDOS ---
  const [stats, setStats] = useState({
    totalMembers: 0,
    balance: 0,
    activities: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Cargamos datos básicos de los servicios que ya tienes
      // Nota: Aquí podrías llamar a tus endpoints .getAll() y simplemente sacar el .length
      const [membersResp, treasuryResp, activitiesResp] = await Promise.all([
        userService.getAll(),
        isAdmin ? treasuryService.getGlobalSummary() : treasuryService.getByUserId(currentUser!.id),
        activityService.getAll()
      ]);

      setStats({
        totalMembers: membersResp.data.length,
        balance: isAdmin ? treasuryResp.data.balance : 0, // Ajusta según tu lógica de socio
        activities: activitiesResp.data.length,
      });
    } catch (error) {
      console.error("Error al cargar dashboard", error);
    }
  };

  // --- CONFIGURACIÓN DE ACCESOS RÁPIDOS SEGÚN ROL ---
  const getQuickActions = () => {
    if (isAdmin) {
      return [
        { title: "Gestión de Usuarios", icon: <UserPlus />, path: "/usuarios", color: "bg-indigo-500", desc: "Altas, bajas y edición" },
        { title: "Estado de Caja", icon: <TrendingUp />, path: "/tesoreria", color: "bg-emerald-500", desc: "Ingresos y gastos" },
        { title: "Control de Almacén", icon: <Package />, path: "/inventario", color: "bg-amber-500", desc: "Stock y materiales" },
        { title: "Control de Actividades", icon: <Calendar />, path: "/actividades", color: "bg-rose-500", desc: "Próximas actividades" },
      ];
    }
    if (isStaff) {
      return [
        { title: "Pasar Lista", icon: <ClipboardList />, path: "/activities", color: "bg-indigo-500", desc: "Control de asistencia" },
        { title: "Mis Equipos", icon: <Users />, path: "/users", color: "bg-emerald-500", desc: "Ver jugadores" },
        { title: "Material", icon: <Package />, path: "/inventory", color: "bg-amber-500", desc: "Consultar inventario" },
      ];
    }
    return [
      { title: "Apuntarse a Actividad", icon: <Calendar />, path: "/activities", color: "bg-indigo-500", desc: "Ver próximos eventos" },
      { title: "Mis Pagos", icon: <Wallet />, path: "/my-payments", color: "bg-emerald-500", desc: "Recibos y cuotas" },
      { title: "Mi Perfil", icon: <UserCircle />, path: "/profile", color: "bg-indigo-500", desc: "Datos personales" },
    ];
  };

  return (
    <div className="space-y-10 pb-10">
      {/* 1. CABECERA CON SALUDO */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-gray-800">
          ¡Hola, {currentUser?.firstName}! 👋
        </h1>
        <p className="text-gray-500 font-medium">
          Esto es lo que está pasando hoy en <span className="text-indigo-600 font-bold">Klubly</span>.
        </p>
      </div>

      {/* 2. TARJETAS DE RESUMEN (REUTILIZADAS) */}
      <section className="space-y-4">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Resumen del Club</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard 
            title={isAdmin ? "Socios Totales" : "Miembros en tu grupo"} 
            value={stats.totalMembers} 
            icon={<Users size={20}/>} 
            variant="indigo" 
          />
          <SummaryCard 
            title={isAdmin ? "Balance de Caja" : "Actividades Disponibles"} 
            value={isAdmin ? `${stats.balance} €` : stats.activities} 
            icon={isAdmin ? <Wallet size={20}/> : <Calendar size={20}/>} 
            variant="emerald" 
          />
          <SummaryCard 
            title="Próximas Actividades" 
            value={stats.activities} 
            icon={<Calendar size={20}/>} 
            variant="indigo" 
          />
        </div>
      </section>

      {/* 3. ACCESOS RÁPIDOS (BOTONERA VITAMINADA) */}
      <section className="space-y-4">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {getQuickActions().map((action, idx) => (
            <button
              key={idx}
              onClick={() => navigate(action.path)}
              className="group relative flex items-center gap-4 p-6 bg-white rounded-2xl border-2 border-gray-50 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all text-left overflow-hidden"
            >
              <div className={`${action.color} p-3 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform`}>
                {/*React.cloneElement(action.icon as React.ReactElement, { size: 24 })*/}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  {action.desc}
                </p>
              </div>
              <ArrowRight className="text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" size={18} />
              
              {/* Decoración sutil de fondo */}
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${action.color} opacity-[0.03] rounded-full`} />
            </button>
          ))}
        </div>
      </section>

      {/* 4. SECCIÓN DE DECORACIÓN O INFO EXTRA */}
      <Card className="bg-indigo-600 border-none p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="relative z-10 space-y-2">
          <h2 className="text-2xl font-black">¿Necesitas ayuda con la gestión?</h2>
          <p className="text-indigo-100 max-w-md">
            Recuerda que puedes consultar el manual de usuario o contactar con soporte técnico desde el menú de configuración.
          </p>
        </div>
        <button className="relative z-10 px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
          Ver Documentación
        </button>
        {/* Círculos decorativos */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400 opacity-20 rounded-full translate-y-1/2 -translate-x-1/4" />
      </Card>
    </div>
  );
};

export default DashboardPage;