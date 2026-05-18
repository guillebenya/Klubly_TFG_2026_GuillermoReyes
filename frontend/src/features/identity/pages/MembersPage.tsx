import { useEffect, useState } from "react";
import {
  Plus,
  Filter,
  Loader2,
  History,
  ArrowLeft,
  Users,
  UserCheck,
  UserCircle,
  Clock,
} from "lucide-react";
import PageHeader from "../../../components/shared/PageHeader.tsx";
import Button from "../../../components/shared/Button.tsx";
import Modal from "../../../components/shared/Modal.tsx";
import MemberCard from "../components/MemberCard.tsx";
import MemberDetails from "../components/MemberDetails.tsx";
import MemberForm from "../components/MemberForm.tsx";
import ConfirmDialog from "../../../components/shared/ConfirmDialog.tsx";
import SuccessDialog from "../../../components/shared/SuccessDialog.tsx";
import SummaryCard from "../../../components/shared/SummaryCard.tsx";
import { userService } from "../services/user.service.ts";
import MemberTeamsManager from "../components/MemberTeamsManager.tsx";
import { teamService } from "../services/team.service.ts";
import MemberFilters from "../components/MemberFilters.tsx";
import { authService } from "../../auth/services/auth.service.ts";

//Función extraída para reducir complejidad
const filterMembers = (
  members: any[],
  searchTerm: string,
  activeFilters: {
    roles: string[];
    status: boolean[];
    teams: number[];
    isPending: boolean[];
  },
  isHistoryMode: boolean,
) =>
  members.filter((m) => {
    const searchString =
      `${m.firstName} ${m.lastName} ${m.email} ${m.username}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesRole =
      activeFilters.roles.length === 0 ||
      activeFilters.roles.includes(m.roleName);

    if (isHistoryMode) return matchesSearch && matchesRole;

    const matchesStatus =
      activeFilters.status.length === 0 ||
      activeFilters.status.includes(m.active);
    const matchesTeam =
      activeFilters.teams.length === 0 ||
      m.affiliations?.some((aff: any) =>
        activeFilters.teams.includes(aff.teamId),
      );
    const matchesPending =
      activeFilters.isPending.length === 0 ||
      activeFilters.isPending.includes(m.isPending);

    return (
      matchesSearch &&
      matchesRole &&
      matchesStatus &&
      matchesTeam &&
      matchesPending
    );
  });

//Componente extraído para reducir complejidad
const SummaryCards = ({
  isAdmin,
  totalMembersCount,
  activeMembersCount,
  pendingMembersCount,
}: {
  isAdmin: boolean;
  totalMembersCount: number;
  activeMembersCount: number;
  pendingMembersCount: number;
}) => (
  <>
    <div className="flex items-center gap-1.5 px-1 mb-2 opacity-80">
      <div className="h-1 w-1 rounded-full bg-indigo-400" />
      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 italic">
        {isAdmin
          ? "Nota: Totales globales del club (no afectados por filtros)."
          : "Nota: Usuarios bajo tu gestión en tus equipos asignados. Los filtros no afectan a estos totales."}
      </p>
    </div>
    <div
      className={`grid grid-cols-1 ${isAdmin ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4`}
    >
      <SummaryCard
        title={isAdmin ? "Total Usuarios" : "Usuarios Gestionados"}
        value={totalMembersCount}
        icon={<Users size={20} />}
        variant="indigo"
      />
      <SummaryCard
        title="Usuarios Activos"
        value={activeMembersCount}
        icon={<UserCheck size={20} />}
        variant="emerald"
      />
      {isAdmin && (
        <SummaryCard
          title="Solicitudes Pendientes"
          value={pendingMembersCount}
          icon={<Clock size={20} />}
          variant={pendingMembersCount > 0 ? "rose" : "indigo"}
        />
      )}
    </div>
  </>
);

const MembersPage = () => {
  // ESTADOS DE DATOS
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isHistoryMode, setIsHistoryMode] = useState(false);

  // ESTADOS PARA MODALES
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [isTeamsOpen, setIsTeamsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [activeFilters, setActiveFilters] = useState({
    roles: [] as string[],
    status: [] as boolean[],
    teams: [] as number[],
    isPending: [] as boolean[],
  });

  // ESTADOS PARA DIÁLOGOS DE CONFIRMACIÓN Y ÉXITO
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

  // Cargar usuarios y equipos
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
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.roleName === "ADMIN";

  const fetchTeams = async () => {
  const resp = await teamService.getAll();
  setAllTeams(resp.data ?? []);
};

  // HANDLERS
  const handleDeleteTrigger = (id: number) => {
    setConfirmConfig({ isOpen: true, type: "delete", data: id });
  };

  const handleSaveTrigger = (formData: any) => {
    setConfirmConfig({ isOpen: true, type: "save", data: formData });
  };

  const executeSave = async () => {
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
  };

  const executeDelete = async () => {
    await userService.delete(confirmConfig.data);
    setSuccessConfig({
      isOpen: true,
      title: "¡Eliminado!",
      desc: "El miembro ha sido dado de baja correctamente del sistema.",
    });
  };

  const executeAction = async () => {
    try {
      setFormLoading(true);
      if (confirmConfig.type === "delete") {
        await executeDelete();
      } else {
        await executeSave();
      }
      setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
    } catch (error) {
      console.error("Error en la operación:", error);
      alert("Hubo un error al procesar la solicitud.");
    } finally {
      setFormLoading(false);
    }
  };

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

  const handleSuccessClose = () => {
    setSuccessConfig((prev) => ({ ...prev, isOpen: false }));
    setIsFormOpen(false);
    fetchMembers();
  };

  const staffTeamIds = currentUser?.teamIds || [];

  const managedMembers = members.filter((m) => {
    if (isAdmin) return true;

    if (m.roleName === "ADMIN") return false;
    const hasCommonTeam = m.affiliations?.some((aff: any) =>
      staffTeamIds.includes(aff.teamId),
    );
    return hasCommonTeam && m.active;
  });

  // CÁLCULOS PARA TARJETAS INFORMATIVAS
  const totalMembersCount = managedMembers.length;
  const activeMembersCount = managedMembers.filter(
    (m) => m.active && !m.isPending,
  ).length;
  const pendingMembersCount = managedMembers.filter((m) => m.isPending).length;

  const activeFilterCount =
    activeFilters.roles.length +
    activeFilters.status.length +
    activeFilters.teams.length +
    activeFilters.isPending.length;

  const filteredMembers = filterMembers(
    managedMembers,
    searchTerm,
    activeFilters,
    isHistoryMode,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={isHistoryMode ? "Historial de Bajas" : "Gestión de Usuarios"}
        subtitle={
          isHistoryMode
            ? "Consulta de registros eliminados del sistema."
            : "Visualiza y gestiona todos los integrantes del club."
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
                Volver a la lista
              </Button>
            ) : (
              <>
                <Button
                  variant={activeFilterCount > 0 ? "primary" : "secondary"}
                  icon={<Filter size={18} />}
                  onClick={() => setIsFilterOpen(true)}
                >
                  Filtros {activeFilterCount > 0}
                </Button>

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

                {isAdmin && (
                  <Button
                    variant="add"
                    icon={<Plus size={18} />}
                    onClick={handleAddNew}
                  >
                    Añadir usuario
                  </Button>
                )}
              </>
            )}
          </>
        }
      />

      {/* TARJETAS DE RESUMEN */}
      {!isHistoryMode && !loading && (
        <SummaryCards
          isAdmin={isAdmin}
          totalMembersCount={totalMembersCount}
          activeMembersCount={activeMembersCount}
          pendingMembersCount={pendingMembersCount}
        />
      )}

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
                  onEdit={isHistoryMode ? undefined : handleEdit}
                  onDelete={isHistoryMode ? undefined : handleDeleteTrigger}
                  isStaffView={!isAdmin}
                  commonTeamsCount={commonTeamsCount}
                />
              );
            })
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-100">
              <UserCircle size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500 italic">
                {isHistoryMode
                  ? "No hay registros en el historial de bajas."
                  : "No hay usuarios que coincidan con la búsqueda."}
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

      {/* MODAL: FORMULARIO */}
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

      {/* MODAL: GESTIÓN DE EQUIPOS */}
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

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
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
