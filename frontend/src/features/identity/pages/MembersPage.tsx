import React, { useEffect, useState } from "react";
import { Plus, Filter, Loader2, History, ArrowLeft } from "lucide-react";
import PageHeader from "../../../components/shared/PageHeader";
import Button from "../../../components/shared/Button";
import Modal from "../../../components/shared/Modal";
import MemberCard from "../components/MemberCard";
import MemberDetails from "../components/MemberDetails";
import MemberForm from "../components/MemberForm";
import ConfirmDialog from "../../../components/shared/ConfirmDialog"; // Importante
import SuccessDialog from "../../../components/shared/SuccessDialog"; // Importante
import { userService } from "../services/user.service.ts";
import MemberTeamsManager from "../components/MemberTeamsManager.tsx";
import { teamService } from "../services/team.service.ts";
import MemberFilters from "../components/MemberFilters.tsx";
import { authService } from "../../auth/services/auth.service.ts";

const MembersPage = () => {
  // --- ESTADOS DE DATOS ---
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isHistoryMode, setIsHistoryMode] = useState(false);

  // --- ESTADOS PARA MODALES ---
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [isTeamsOpen, setIsTeamsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [allTeams, setAllTeams] = useState<any[]>([]); // Para el selector de equipos
  const [activeFilters, setActiveFilters] = useState({
    roles: [] as string[],
    status: [] as boolean[],
    teams: [] as number[],
  });

  // --- ESTADOS PARA DIÁLOGOS DE CONFIRMACIÓN Y ÉXITO ---
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    type: "save" | "delete";
    data?: any;
  }>({
    isOpen: false,
    type: "save",
  });

  const [successConfig, setSuccessConfig] = useState({
    isOpen: false,
    title: "",
    desc: "",
  });

  //Cargar miembros y equipos
  useEffect(() => {
    fetchMembers();
    fetchTeams();
  }, [isHistoryMode]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = isHistoryMode
        ? await userService.getDeletedHistory()
        : await userService.getAll();
      setMembers(response.data);
    } catch (error) {
      console.error("Error cargando miembros:", error);
    } finally {
      setLoading(false);
    }
  };

  //Para comprobar si el usuario actual es Admin y mostrar el botón de añadir miembro solo a ellos
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.roleName === "ADMIN";

  const fetchTeams = async () => {
    const resp = await teamService.getAll();
    setAllTeams(resp.data);
  };

  //HANDLERS QUE DISPARAN LA CONFIRMACIÓN

  // Para Borrar
  const handleDeleteTrigger = (id: number) => {
    setConfirmConfig({
      isOpen: true,
      type: "delete",
      data: id,
    });
  };

  // Para Guardar (Crear/Editar)
  const handleSaveTrigger = (formData: any) => {
    setConfirmConfig({
      isOpen: true,
      type: "save",
      data: formData,
    });
  };

  //EJECUCIÓN DE LA CONFIRMACIÓN (Borrado o Guardado, según el tipo)
  const executeAction = async () => {
    try {
      setFormLoading(true);

      if (confirmConfig.type === "delete") {
        // Lógica de borrado
        await userService.delete(confirmConfig.data);
        setSuccessConfig({
          isOpen: true,
          title: "¡Eliminado!",
          desc: "El miembro ha sido dado de baja correctamente del sistema.",
        });
      } else {
        // Lógica de guardado (Crear o Editar)
        const formData = confirmConfig.data;
        if (selectedMember) {
          await userService.update(selectedMember.id, formData);
        } else {
          await userService.create(formData);
        }

        setSuccessConfig({
          isOpen: true,
          title: "¡Guardado!",
          desc: "La información del miembro se ha actualizado con éxito.",
        });
      }

      setConfirmConfig({ ...confirmConfig, isOpen: false }); // Cerramos confirmación
    } catch (error) {
      console.error("Error en la operación:", error);
      alert("Hubo un error al procesar la solicitud.");
    } finally {
      setFormLoading(false);
    }
  };

  //OTROS HANDLERS
  const handleView = (member: any) => {
    setSelectedMember(member);
    setIsViewOpen(true);
  };

  const handleAddNew = () => {
    setSelectedMember(null);
    setIsFormOpen(true);
  };

  const handleEdit = (member: any) => {
    setSelectedMember(member);
    setIsFormOpen(true);
  };

  const handleManageTeams = (member: any) => {
    setSelectedMember(member);
    setIsViewOpen(false);
    setIsTeamsOpen(true);
  };

  // FUNCIÓN PARA CERRAR EL ÉXITO Y LIMPIAR TODO
  const handleSuccessClose = () => {
    setSuccessConfig({ ...successConfig, isOpen: false });
    setIsFormOpen(false); // Cerramos el formulario (si estaba abierto)
    fetchMembers(); // Refrescamos la lista
  };

  // 1. Preparamos los IDs de equipo del Staff para comparar
  const staffTeamIds = currentUser?.teamIds || [];

  const filteredMembers = members.filter((m) => {
    // --- A. BÚSQUEDA Y ROLES (Se mantienen en ambos modos) ---
    const searchString =
      `${m.firstName} ${m.lastName} ${m.email} ${m.username}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());

    const matchesRole =
      activeFilters.roles.length === 0 ||
      activeFilters.roles.includes(m.roleName);

    // --- B. LÓGICA DIFERENCIADA POR MODO ---
    if (isHistoryMode) {
      // En el historial, no filtramos por equipo ni por estado activo,
      // porque ya sabemos que todos son "bajas".
      return matchesSearch && matchesRole;
    }

    // --- C. VISTA NORMAL (Lo que ya tenías) ---
    const matchesStatus =
      activeFilters.status.length === 0 ||
      activeFilters.status.includes(m.active);

    const matchesTeam =
      activeFilters.teams.length === 0 ||
      m.affiliations?.some((aff: any) =>
        activeFilters.teams.includes(aff.teamId),
      );

    // Restricciones de Staff (solo para vista normal)
    if (!isAdmin) {
      if (m.roleName === "ADMIN") return false;
      const hasCommonTeam = m.affiliations?.some((aff: any) =>
        staffTeamIds.includes(aff.teamId),
      );
      if (!hasCommonTeam) return false;
      if (!m.active) return false;
    }

    return matchesSearch && matchesRole && matchesStatus && matchesTeam;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={isHistoryMode ? "Historial de Bajas" : "Gestión de Miembros"} // <--- TÍTULO DINÁMICO
        subtitle={
          isHistoryMode
            ? "Consulta de registros eliminados del sistema."
            : "Visualiza y gestiona todos los integrantes del club."
        }
        onSearch={setSearchTerm}
        actions={
          <>
            {isHistoryMode ? (
              // BOTÓN PARA VOLVER
              <Button
                variant="secondary"
                icon={<ArrowLeft size={18} />}
                onClick={() => setIsHistoryMode(false)}
              >
                Volver a la lista
              </Button>
            ) : (
              <>
                {/* FILTROS (Solo en vista normal) */}
                <Button
                  variant={
                    activeFilters.roles.length +
                      activeFilters.status.length +
                      activeFilters.teams.length >
                    0
                      ? "primary"
                      : "secondary"
                  }
                  icon={<Filter size={18} />}
                  onClick={() => setIsFilterOpen(true)}
                >
                  Filtros{" "}
                  {activeFilters.roles.length +
                    activeFilters.status.length +
                    activeFilters.teams.length >
                    0 && `(...)`}
                </Button>

                {/* BOTÓN HISTORIAL (Solo para Admin) */}
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

                {/* AÑADIR (Solo para Admin) */}
                {isAdmin && (
                  <Button
                    variant="add"
                    icon={<Plus size={18} />}
                    onClick={handleAddNew}
                  >
                    Añadir miembro
                  </Button>
                )}
              </>
            )}
          </>
        }
      />

      {/* LISTADO: Usa la constante 'filteredMembers' que acabamos de definir arriba */}
      {/* LISTADO */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mb-2" size={40} />
          <p className="font-medium italic">Sincronizando base de datos...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => {
              const staffTeamIds = currentUser?.teamIds || [];
              const commonTeamsCount =
                member.affiliations?.filter((aff: any) =>
                  staffTeamIds.includes(aff.teamId),
                ).length || 0;

              return (
                <MemberCard
                  key={member.id}
                  member={member}
                  onView={handleView}
                  // Si estamos en modo historial, le pasamos null a onEdit y onDelete para que no muestre los botones
                  onEdit={isHistoryMode ? undefined : handleEdit}
                  onDelete={isHistoryMode ? undefined : handleDeleteTrigger}
                  isStaffView={!isAdmin}
                  commonTeamsCount={commonTeamsCount}
                />
              );
            })
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-100">
              <p className="text-gray-500">
                {isHistoryMode
                  ? "No hay registros en el historial de bajas."
                  : "No hay miembros que coincidan con los filtros aplicados."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODAL DE FILTROS */}
      <Modal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filtros Avanzados"
        size="sm"
      >
        <MemberFilters
          filters={activeFilters}
          setFilters={setActiveFilters}
          availableTeams={allTeams}
          onApply={() => setIsFilterOpen(false)}
        />
      </Modal>

      {/* MODAL: VER DETALLES */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Ficha del Miembro"
        size="lg"
      >
        {selectedMember && (
          <MemberDetails
            member={selectedMember}
            onManageTeams={handleManageTeams}
          />
        )}
      </Modal>

      {/* MODAL 2: FORMULARIO (Cambiamos handleSave por handleSaveTrigger) */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedMember ? "Editar Miembro" : "Nuevo Miembro"}
      >
        <MemberForm
          initialData={selectedMember}
          onSubmit={handleSaveTrigger}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* MODAL 3: GESTIÓN DE EQUIPOS */}
      <Modal
        isOpen={isTeamsOpen}
        onClose={() => setIsTeamsOpen(false)}
        title={`Equipos de ${selectedMember?.firstName}`}
      >
        {selectedMember && (
          <MemberTeamsManager
            member={selectedMember}
            onRefresh={() => {
              fetchMembers();
              setIsTeamsOpen(false);
            }}
          />
        )}
      </Modal>

      {/* --- DIÁLOGOS DE SISTEMA (GENERALES) --- */}

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={executeAction}
        title="¿Confirmar operación?"
        description={
          confirmConfig.type === "delete"
            ? "¿Estás seguro de que deseas dar de baja a este miembro? Esta acción no se puede deshacer fácilmente."
            : "¿Deseas guardar los cambios realizados en la ficha del miembro?"
        }
        confirmLabel={
          confirmConfig.type === "delete" ? "Eliminar" : "Guardar Cambios"
        }
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

export default MembersPage;
