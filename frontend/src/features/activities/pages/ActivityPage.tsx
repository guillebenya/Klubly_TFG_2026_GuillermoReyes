import { useEffect, useState, useMemo } from "react";
import {
  Calendar,
  Filter,
  History,
  Plus,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import PageHeader from "../../../components/shared/PageHeader";
import Button from "../../../components/shared/Button";
import Modal from "../../../components/shared/Modal";
import SummaryCard from "../../../components/shared/SummaryCard";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import SuccessDialog from "../../../components/shared/SuccessDialog";
import ActivityCard from "../components/ActivityCard";
import ActivityDetails from "../components/ActivityDetails";
import ActivityForm from "../components/ActivityForm";
import ActivityFilters from "../components/ActivityFilters";
import { activityService, type Activity } from "../services/activity.service";
import { authService } from "../../auth/services/auth.service";

//Lógica de filtrado extraída para reducir la complejidad cognitiva del componente principal
const getFilteredActivities = (activities: Activity[], params: any) => {
  const {
    isAdmin,
    isStaff,
    currentUser,
    searchTerm,
    activeFilters,
    isHistoryMode,
  } = params;

  return activities.filter((a) => {
    // Verificación de visibilidad
    const isGlobal = a.teamIds.length === 0;
    const isMyTeam = a.teamIds.some((id) =>
      (currentUser?.teamIds || []).includes(id),
    );
    const canView = isAdmin || isGlobal || isMyTeam;

    if (!canView) return false;

    // Verificación de Búsqueda y Filtros básicos
    const matchesSearch = `${a.name} ${a.location}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesTeam =
      activeFilters.teams.length === 0 ||
      a.teamIds.some((id) => activeFilters.teams.includes(id)) ||
      (activeFilters.teams.includes(0) && isGlobal);

    const actDate = new Date(a.startDate);
    const matchesDate =
      (!activeFilters.dateRange.start ||
        actDate >= new Date(activeFilters.dateRange.start)) &&
      (!activeFilters.dateRange.end ||
        actDate <= new Date(activeFilters.dateRange.end));

    const isPast = actDate < new Date();
    const matchesPast = !activeFilters.showPast || isPast;

    if (!matchesSearch || !matchesTeam || !matchesDate || !matchesPast)
      return false;

    //Verificación de Estado / Historial
    if (isHistoryMode) return true;

    const statusAllowed =
      activeFilters.status.length === 0 ||
      activeFilters.status.includes(a.active);

    // Si es Admin/Staff depende del filtro de estado, si es Member solo ve las activas
    return isAdmin || isStaff ? statusAllowed : a.active;
  });
};

// Lógica de ordenación por bloques de estado y cronología
const getSortedActivities = (activities: Activity[]) => {
  const nowTime = Date.now();
  return [...activities].sort((a, b) => {
    const timeA = new Date(a.startDate).getTime();
    const timeB = new Date(b.startDate).getTime();
    const isPastA = timeA < nowTime;
    const isPastB = timeB < nowTime;

    // Asignación de pesos según los 4 tipos de situaciones
    const getGroupScore = (act: Activity, isPast: boolean) => {
      if (act.active && !isPast) return 4; // 1. Activas Próximas
      if (act.active && isPast) return 3; // 2. Activas Finalizadas
      if (!act.active && !isPast) return 2; // 3. Inactivas Próximas
      return 1; // 4. Inactivas Finalizadas
    };

    const scoreA = getGroupScore(a, isPastA);
    const scoreB = getGroupScore(b, isPastB);

    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    // Si están en el mismo grupo, aplicamos su orden cronológico ideal
    if (!isPastA) {
      // Próximas: De más cercana a más lejana (Ascendente)
      return timeA - timeB;
    } else {
      // Pasadas: De más reciente a más antigua (Descendente)
      return timeB - timeA;
    }
  });
};

const ActivityPage = () => {
  // SEGURIDAD
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.roleName === "ADMIN";
  const isStaff = currentUser?.roleName === "STAFF";
  const isMember = currentUser?.roleName === "MEMBER";

  // ESTADOS DE DATOS
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isHistoryMode, setIsHistoryMode] = useState(false);

  // ESTADOS PARA MODALES Y FILTROS
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    teams: [] as number[],
    status: [] as boolean[],
    dateRange: { start: "", end: "" },
    showPast: false,
  });

  // CONFIRMACIÓN Y ÉXITO
  const [confirmConfig, setConfirmConfig] = useState<any>({
    isOpen: false,
    type: "save",
  });
  const [successConfig, setSuccessConfig] = useState({
    isOpen: false,
    title: "",
    desc: "",
  });

  useEffect(() => {
    fetchActivities();
  }, [isHistoryMode]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = isHistoryMode
        ? await activityService.getDeletedHistory()
        : await activityService.getAll();
      setActivities(response.data);
    } catch (error) {
      console.error("Error cargando actividades:", error);
    } finally {
      setLoading(false);
    }
  };

  // Lógica de filtrado y ordenación mediante useMemo
  const filteredAndSorted = useMemo(() => {
    const filtered = getFilteredActivities(activities, {
      isAdmin,
      isStaff,
      currentUser,
      searchTerm,
      activeFilters,
      isHistoryMode,
    });
    return getSortedActivities(filtered);
  }, [
    activities,
    searchTerm,
    activeFilters,
    isHistoryMode,
    isAdmin,
    isStaff,
    currentUser,
  ]);

  // Estadísticas para SummaryCards (Filtrando solo las activas)
  const stats = useMemo(() => {
    const now = new Date();
    const activeActivities = activities.filter((a) => a.active);
    return {
      thisMonth: activeActivities.filter((a) => {
        const d = new Date(a.startDate);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }).length,
      full: activeActivities.filter((a) => a.registeredCount >= a.capacity)
        .length,
      activeCount: activeActivities.length,
    };
  }, [activities]);

  const handleView = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsViewOpen(true);
  };

  const handleEdit = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsFormOpen(true);
  };

  const executeAction = async () => {
    try {
      setFormLoading(true);
      if (confirmConfig.type === "delete") {
        await activityService.delete(confirmConfig.data);
        setSuccessConfig({
          isOpen: true,
          title: "¡Eliminada!",
          desc: "La actividad ha sido enviada al historial.",
        });
      } else {
        const data = confirmConfig.data;
        if (selectedActivity)
          await activityService.update(selectedActivity.id, data);
        else await activityService.create(data);
        setSuccessConfig({
          isOpen: true,
          title: "¡Guardado!",
          desc: "La información se ha actualizado correctamente.",
        });
      }
      setConfirmConfig({ ...confirmConfig, isOpen: false });
    } catch (error) {
      console.error("Error al procesar:", error);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          isHistoryMode ? "Historial de Actividades" : "Gestión de Actividades"
        }
        subtitle={
          isHistoryMode
            ? "Consulta de actividades dadas de baja."
            : "Visualiza y gestiona todas las actividades del club."
        }
        onSearch={setSearchTerm}
        actions={
          <>
            {isHistoryMode ? (
              <Button
                variant="secondary"
                icon={<ArrowLeft size={18} />}
                onClick={() => setIsHistoryMode(false)}
              >
                Volver al listado
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant={
                    activeFilters.teams.length + activeFilters.status.length > 0
                      ? "primary"
                      : "secondary"
                  }
                  icon={<Filter size={18} />}
                  onClick={() => setIsFilterOpen(true)}
                >
                  Filtros
                </Button>
                {(isAdmin || isStaff) && (
                  <>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        icon={<History size={18} />}
                        className="!text-indigo-600"
                        onClick={() => setIsHistoryMode(true)}
                      >
                        Ver Bajas
                      </Button>
                    )}
                    <Button
                      variant="add"
                      icon={<Plus size={18} />}
                      onClick={() => {
                        setSelectedActivity(null);
                        setIsFormOpen(true);
                      }}
                    >
                      Añadir Actividad
                    </Button>
                  </>
                )}
              </div>
            )}
          </>
        }
      />

      {/* Nota informativa */}
      <div className="flex items-center gap-1.5 px-1 mb-2 opacity-80">
        <div className="h-1 w-1 rounded-full bg-indigo-400" />
        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 italic">
          Nota: Las tarjetas resumen muestran totales globales y no se ven
          afectados por los filtros de búsqueda.
        </p>
      </div>
      {!isHistoryMode && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SummaryCard
            title="Actividades este mes"
            value={stats.thisMonth}
            icon={<Calendar size={20} />}
            variant="indigo"
          />
          <SummaryCard
            title="Ocupación de plazas"
            value={`${stats.full} de ${stats.activeCount} llenas`}
            icon={
              stats.full > 0 ? (
                <AlertCircle size={20} />
              ) : (
                <CheckCircle size={20} />
              )
            }
            variant={stats.full > stats.activeCount / 2 ? "rose" : "emerald"}
          />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mb-2" size={40} />
          <p className="font-medium italic">Sincronizando actividades...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredAndSorted.length > 0 ? (
            filteredAndSorted.map((activity) => {
              const isPast = new Date(activity.startDate) < new Date();
              return (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onView={handleView}
                  onEdit={
                    (isAdmin || isStaff) && !isHistoryMode && !isPast
                      ? handleEdit
                      : undefined
                  }
                  onDelete={
                    (isAdmin || isStaff) && !isHistoryMode && !isPast
                      ? (id) =>
                          setConfirmConfig({
                            isOpen: true,
                            type: "delete",
                            data: id,
                          })
                      : undefined
                  }
                  isMember={isMember && !isPast}
                  onRefresh={fetchActivities}
                />
              );
            })
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-100">
              <Calendar size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500 italic">
                No se han encontrado actividades.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modales y Diálogos */}
      <Modal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filtros"
        size="sm"
      >
        <ActivityFilters
          filters={activeFilters}
          setFilters={setActiveFilters}
          onApply={() => setIsFilterOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Detalle"
        size="lg"
      >
        {selectedActivity && (
          <ActivityDetails
            activity={
              activities.find((a) => a.id === selectedActivity.id) ||
              selectedActivity
            }
            isHistoryMode={isHistoryMode}
            onRefresh={fetchActivities}
          />
        )}
      </Modal>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedActivity ? "Editar" : "Nueva"}
      >
        <ActivityForm
          initialData={selectedActivity}
          onSubmit={(data) =>
            setConfirmConfig({ isOpen: true, type: "save", data })
          }
          onCancel={() => setIsFormOpen(false)}
          loading={formLoading}
        />
      </Modal>

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={executeAction}
        title="¿Confirmar operación?"
        description={
          confirmConfig.type === "delete"
            ? "¿Dar de baja esta actividad?"
            : "¿Guardar cambios?"
        }
        confirmLabel={confirmConfig.type === "delete" ? "Eliminar" : "Guardar"}
        type={confirmConfig.type === "delete" ? "danger" : "warning"}
        isLoading={formLoading}
      />

      <SuccessDialog
        isOpen={successConfig.isOpen}
        onClose={() => {
          setSuccessConfig({ ...successConfig, isOpen: false });
          setIsFormOpen(false);
          fetchActivities();
        }}
        title={successConfig.title}
        description={successConfig.desc}
      />
    </div>
  );
};

export default ActivityPage;
