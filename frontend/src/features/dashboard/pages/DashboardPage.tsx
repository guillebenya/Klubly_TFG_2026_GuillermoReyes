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
  UserCircle,
  AlertTriangle,
  Scale,
  Settings,
} from "lucide-react";

// Componentes Compartidos
import SummaryCard from "../../../components/shared/SummaryCard";

// Servicios
import { authService } from "../../auth/services/auth.service";
import { userService } from "../../identity/services/user.service";
import {
  treasuryService,
  TransactionType,
} from "../../treasury/services/treasury.service";
import { activityService } from "../../activities/services/activity.service";
import { itemService } from "../../inventory/services/item.service";

const DashboardPage = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.roleName === "ADMIN";
  const isStaff = currentUser?.roleName === "STAFF";
  const isMember = currentUser?.roleName === "MEMBER";

  const [stats, setStats] = useState({
    membersCount: 0,
    balance: 0,
    activitiesCount: 0,
    lowStockCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Promesas dinámicas según rol
      const promises: any[] = [userService.getAll(), activityService.getAll()];

      // Añadimos llamadas específicas según el rol
      if (isAdmin) {
        promises.push(treasuryService.getGlobalSummary());
        promises.push(itemService.getAll());
      } else if (isStaff) {
        promises.push(itemService.getAll());
      } else if (isMember) {
        promises.push(treasuryService.getByUserId(currentUser!.id));
      }

      const results = await Promise.all(promises);

      const membersResp = results[0];
      const activitiesResp = results[1];

      let balance = 0;
      let lowStock = 0;

      // Lógica de procesamiento según rol
      if (isAdmin) {
        balance = results[2].data.balance;
        lowStock = results[3].data.filter(
          (i: any) => i.stockQuantity <= i.minStock,
        ).length;
      } else if (isStaff) {
        lowStock = results[2].data.filter(
          (i: any) => i.stockQuantity <= i.minStock,
        ).length;
      } else if (isMember) {
        // Calculamos balance personal igual que en MyPaymentsPage
        const transactions = results[2].data;
        const totalAportado = transactions
          .filter((t: any) => t.type === TransactionType.INCOME)
          .reduce((acc: number, t: any) => acc + t.amount, 0);
        const totalRecibido = transactions
          .filter((t: any) => t.type === TransactionType.EXPENSE)
          .reduce((acc: number, t: any) => acc + t.amount, 0);
        balance = totalRecibido - totalAportado;
      }

      // Filtrado de miembros para Staff
      const staffTeamIds = currentUser?.teamIds || [];
      const managedMembers = membersResp.data.filter((m: any) => {
        if (isAdmin) return true;
        if (m.roleName === "ADMIN") return false;
        return m.affiliations?.some((aff: any) =>
          staffTeamIds.includes(aff.teamId),
        );
      });

      const upcomingActivitiesCount = activitiesResp.data.filter(
        (a: any) => new Date(a.startDate) > new Date()
      ).length;

      setStats({
        membersCount: managedMembers.length,
        balance: balance,
        activitiesCount: upcomingActivitiesCount,
        lowStockCount: lowStock,
      });
    } catch (error) {
      console.error("Error al cargar dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getQuickActions = () => {
    if (isAdmin) {
      return [
        {
          title: "Gestión de Usuarios",
          icon: <UserPlus size={24} />,
          path: "/usuarios",
          color: "bg-indigo-500",
          desc: "Altas, bajas y edición",
        },
        {
          title: "Estado de Caja",
          icon: <TrendingUp size={24} />,
          path: "/tesoreria",
          color: "bg-emerald-500",
          desc: "Ingresos y gastos",
        },
        {
          title: "Control de Inventario",
          icon: <Package size={24} />,
          path: "/inventario",
          color: "bg-amber-500",
          desc: "Stock y materiales",
        },
        {
          title: "Actividades",
          icon: <Calendar size={24} />,
          path: "/actividades",
          color: "bg-rose-500",
          desc: "Organizar eventos",
        },
        {
          title: "Configuración",
          icon: <Settings size={24} />,
          path: "/configuracion",
          color: "bg-gray-500",
          desc: "Configuración de roles, equipos y categorías de inventario",
        },
      ];
    }
    if (isStaff) {
      return [
        {
          title: "Ver Usuarios",
          icon: <Users size={24} />,
          path: "/usuarios",
          color: "bg-emerald-500",
          desc: "Jugadores de mis equipos",
        },
        {
          title: "Inventario",
          icon: <Package size={24} />,
          path: "/inventario",
          color: "bg-amber-500",
          desc: "Consultar material",
        },
        {
          title: "Actividades",
          icon: <ClipboardList size={24} />,
          path: "/actividades",
          color: "bg-indigo-500",
          desc: "Próximos eventos",
        },
        {
          title: "Mi Perfil",
          icon: <UserCircle size={24} />,
          path: "/mi-perfil",
          color: "bg-rose-500",
          desc: "Datos personales",
        },
      ];
    }
    return [
      {
        title: "Próximas Actividades",
        icon: <Calendar size={24} />,
        path: "/actividades",
        color: "bg-indigo-500",
        desc: "Ver próximos eventos",
      },
      {
        title: "Mis Pagos",
        icon: <Wallet size={24} />,
        path: "/mis-pagos",
        color: "bg-emerald-500",
        desc: "Recibos y cuotas",
      },
      {
        title: "Mi Perfil",
        icon: <UserCircle size={24} />,
        path: "/mi-perfil",
        color: "bg-rose-500",
        desc: "Mis datos personales",
      },
    ];
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-gray-800">
          ¡Hola, {currentUser?.firstName}! 👋
        </h1>
        <p className="text-gray-500 font-medium">
          Bienvenido al panel de control de{" "}
          <span className="text-indigo-600 font-bold">Klubly</span>.
        </p>
      </div>

      {/* TARJETAS DE RESUMEN (Adaptadas por rol) */}
      <section className="space-y-4">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">
          Estado Actual
        </h2>
        <div
          className={`grid grid-cols-1 ${isMember ? "md:grid-cols-2" : "md:grid-cols-3"} gap-4`}
        >
          {/* Card 1: Usuarios (Solo Admin y Staff) */}
          {!isMember && (
            <SummaryCard
              title={isAdmin ? "Usuarios Totales" : "Usuarios en mis Equipos"}
              value={stats.membersCount}
              icon={<Users size={20} />}
              variant="indigo"
            />
          )}

          {/* Card: Actividades (Todos los roles) */}
          <SummaryCard
            title="Actividades Programadas"
            value={stats.activitiesCount}
            icon={<Calendar size={20} />}
            variant="indigo"
          />

          {/* Card: Balance (Admin: Global, Member: Personal) */}
          {(isAdmin || isMember) && (
            <SummaryCard
              title={isAdmin ? "Balance Global" : "Mi Balance Personal"}
              value={formatCurrency(stats.balance)}
              icon={<Scale size={20} />}
              variant={stats.balance >= 0 ? "emerald" : "rose"}
            />
          )}

          {/* Card 3: Stock (Solo Admin y Staff) */}
          {(isAdmin || isStaff) && (
            <SummaryCard
              title="Alertas de Stock"
              value={stats.lowStockCount}
              icon={<AlertTriangle size={20} />}
              variant={stats.lowStockCount > 0 ? "rose" : "emerald"}
            />
          )}
        </div>
      </section>

      {/* ACCESOS RÁPIDOS */}
      <section className="space-y-4">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">
          Accesos Rápidos
        </h2>
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin || isStaff ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-4`}
        >
          {getQuickActions().map((action, idx) => (
            <button
              key={idx}
              onClick={() => navigate(action.path)}
              className="group relative flex flex-col gap-4 p-6 bg-white rounded-2xl border-2 border-gray-50 hover:border-indigo-500 hover:shadow-xl transition-all text-left overflow-hidden"
            >
              <div
                className={`${action.color} p-3 w-fit rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform`}
              >
                {action.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  {action.desc}
                </p>
              </div>
              <ArrowRight
                className="absolute right-4 bottom-4 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all"
                size={18}
              />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;