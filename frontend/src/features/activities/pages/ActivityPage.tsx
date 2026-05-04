import React, { useEffect, useState } from "react";
import {
  Plus,
  Filter,
  Loader2,
  History,
  ArrowLeft,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// Componentes Compartidos
import PageHeader from "../../../components/shared/PageHeader";
import Button from "../../../components/shared/Button";
import Modal from "../../../components/shared/Modal";
import SummaryCard from "../../../components/shared/SummaryCard"; // Importamos el shared
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import SuccessDialog from "../../../components/shared/SuccessDialog";

// Componentes del Dominio
import ActivityCard from "../components/ActivityCard";
import ActivityDetails from "../components/ActivityDetails";
import ActivityForm from "../components/ActivityForm";
import ActivityFilters from "../components/ActivityFilters";

// Servicios y Tipos
import { activityService, type Activity } from "../services/activity.service";
import { authService } from "../../auth/services/auth.service";

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

  // ESTADOS PARA MODALES
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // ESTADO DE FILTROS
  const [activeFilters, setActiveFilters] = useState({
    teams: [] as number[],
    status: [] as boolean[],
    dateRange: { start: "", end: "" },
  });

  // CONFIRMACIÓN Y ÉXITO
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    type: "save" | "delete";
    data?: any;
  }>({ isOpen: false, type: "save" });

  const [successConfig, setSuccessConfig] = useState({
    isOpen: false,
    title: "",
    desc: "",
  });

  // Cargar datos
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

  // --- CÁLCULOS PARA TARJETAS INFORMATIVAS ---
  const now = new Date();
  const activitiesThisMonth = activities.filter((a) => {
    const d = new Date(a.startDate);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;

  const fullActivities = activities.filter(
    (a) => a.registeredCount >= a.capacity,
  ).length;
  const totalActivities = activities.length;

  // HANDLERS
  const handleView = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsViewOpen(true);
  };

  const handleAddNew = () => {
    setSelectedActivity(null);
    setIsFormOpen(true);
  };

  const handleEdit = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsFormOpen(true);
  };

  const handleDeleteTrigger = (id: number) => {
    setConfirmConfig({ isOpen: true, type: "delete", data: id });
  };

  const handleSaveTrigger = (formData: any) => {
    setConfirmConfig({ isOpen: true, type: "save", data: formData });
  };

  const executeAction = async () => {
    try {
      setFormLoading(true);
      if (confirmConfig.type === "delete") {
        await activityService.delete(confirmConfig.data);
        setSuccessConfig({
          isOpen: true,
          title: "¡Eliminada!",
          desc: "La actividad ha sido enviada al historial de bajas.",
        });
      } else {
        const data = confirmConfig.data;
        if (selectedActivity) {
          await activityService.update(selectedActivity.id, data);
        } else {
          await activityService.create(data);
        }
        setSuccessConfig({
          isOpen: true,
          title: "¡Guardado!",
          desc: "La información de la actividad se ha actualizado correctamente.",
        });
      }
      setConfirmConfig({ ...confirmConfig, isOpen: false });
    } catch (error) {
      alert("Error al procesar la solicitud.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessConfig({ ...successConfig, isOpen: false });
    setIsFormOpen(false);
    fetchActivities();
  };

  // LÓGICA DE FILTRADO
  const filteredActivities = activities.filter((a) => {
    if (!isAdmin) {
      const userTeamIds = currentUser?.teamIds || [];
      const isGlobalActivity = a.teamIds.length === 0;
      const isMyTeamActivity = a.teamIds.some((id) => userTeamIds.includes(id));
      if (!isGlobalActivity && !isMyTeamActivity) return false;
    }

    const searchString = `${a.name} ${a.location}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());

    const matchesTeam =
      activeFilters.teams.length === 0 ||
      a.teamIds.some((id) => activeFilters.teams.includes(id)) ||
      (activeFilters.teams.includes(0) && a.teamIds.length === 0);

    const actDate = new Date(a.startDate);
    const matchesDate =
      (!activeFilters.dateRange.start ||
        actDate >= new Date(activeFilters.dateRange.start)) &&
      (!activeFilters.dateRange.end ||
        actDate <= new Date(activeFilters.dateRange.end));

    if (isHistoryMode) return matchesSearch && matchesTeam && matchesDate;

    if (!isAdmin && !isStaff) {
      if (!a.active) return false;
    } else {
      if (
        activeFilters.status.length > 0 &&
        !activeFilters.status.includes(a.active)
      ) {
        return false;
      }
    }

    return matchesSearch && matchesTeam && matchesDate;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          isHistoryMode ? "Historial de Actividades" : "Gestión de Actividades"
        }
        subtitle={
          isHistoryMode
            ? "Consulta de eventos y entrenamientos dados de baja."
            : "Organiza y supervisa las actividades del club."
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
              <>
                <Button
                  variant={
                    activeFilters.teams.length + activeFilters.status.length >
                      0 || activeFilters.dateRange.start !== ""
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
                        className="!text-indigo-600 hover:!bg-indigo-50"
                        onClick={() => setIsHistoryMode(true)}
                      >
                        Ver Bajas
                      </Button>
                    )}
                    <Button
                      variant="add"
                      icon={<Plus size={18} />}
                      onClick={handleAddNew}
                    >
                      Añadir Actividad
                    </Button>
                  </>
                )}
              </>
            )}
          </>
        }
      />

      {/* TARJETAS DE RESUMEN (Globales) */}
      {!isHistoryMode && !loading && (
        <>
          {/* Nota informativa */}
          <div className="flex items-center gap-1.5 px-1 mb-2 opacity-80">
            <div className="h-1 w-1 rounded-full bg-indigo-400" />
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 italic">
              {isAdmin
                ? "Nota: Las tarjetas resumen muestran totales globales y no se ven afectados por los filtros de búsqueda."
                : "Nota: Las tarjetas resumen muestran totales de tus actividades asignadas. Los filtros no afectan a estos totales."}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SummaryCard
              title="Actividades este mes"
              value={activitiesThisMonth}
              icon={<Calendar size={20} />}
              variant="indigo"
            />
            <SummaryCard
              title="Ocupación de plazas"
              value={`${fullActivities} de ${totalActivities} llenas`}
              icon={
                fullActivities > 0 ? (
                  <AlertCircle size={20} />
                ) : (
                  <CheckCircle size={20} />
                )
              }
              variant={
                fullActivities > totalActivities / 2 ? "rose" : "emerald"
              }
            />
          </div>
        </>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mb-2" size={40} />
          <p className="font-medium italic">Sincronizando actividades...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onView={handleView}
                onEdit={
                  (isAdmin || isStaff) && !isHistoryMode
                    ? handleEdit
                    : undefined
                }
                onDelete={
                  (isAdmin || isStaff) && !isHistoryMode
                    ? handleDeleteTrigger
                    : undefined
                }
                isMember={isMember}
                onRefresh={fetchActivities}
              />
            ))
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

      {/* MODALES, CONFIRMACIONES Y ÉXITO (Sin cambios) */}
      <Modal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filtros de Actividades"
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
        title="Detalle de la Actividad"
        size="lg"
      >
        {selectedActivity && (
          <ActivityDetails
            activity={selectedActivity}
            isHistoryMode={isHistoryMode}
          />
        )}
      </Modal>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedActivity ? "Editar Actividad" : "Nueva Actividad"}
      >
        <ActivityForm
          initialData={selectedActivity}
          onSubmit={handleSaveTrigger}
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
            ? "¿Estás seguro de dar de baja esta actividad?"
            : "¿Guardar cambios?"
        }
        confirmLabel={confirmConfig.type === "delete" ? "Eliminar" : "Guardar"}
        type={confirmConfig.type === "delete" ? "danger" : "warning"}
        isLoading={formLoading}
      />

      <SuccessDialog
        isOpen={successConfig.isOpen}
        onClose={handleSuccessClose}
        title={successConfig.title}
        description={successConfig.desc}
      />
    </div>
  );
};

export default ActivityPage;
