import React, { useEffect, useState } from "react";
import { Users2, Plus, Loader2, History, ArrowLeft } from "lucide-react";
import Button from "../../../components/shared/Button";
import Modal from "../../../components/shared/Modal";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import SuccessDialog from "../../../components/shared/SuccessDialog";
import TeamCard from "./TeamCard";
import TeamDetails from "./TeamDetails";
import { teamService, type Team } from "../services/team.service";

//Componentes extraídos para reducir complejidad
const TeamsSectionHeader = ({
  isHistoryMode,
  onToggleHistory,
  onAddNew,
}: {
  isHistoryMode: boolean;
  onToggleHistory: (val: boolean) => void;
  onAddNew: () => void;
}) => (
  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
    <div className="flex items-center gap-3">
      <div
        className={`p-2 rounded-lg ${isHistoryMode ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600"}`}
      >
        {isHistoryMode ? <History size={20} /> : <Users2 size={20} />}
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tight">
          {isHistoryMode ? "Historial de Equipos" : "Listado de Equipos"}
        </h3>
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
          {isHistoryMode
            ? "Bajas registradas"
            : "Administra los equipos del club"}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {isHistoryMode ? (
        <Button
          variant="secondary"
          size="sm"
          icon={<ArrowLeft size={18} />}
          onClick={() => onToggleHistory(false)}
        >
          Volver
        </Button>
      ) : (
        <>
          <Button
            variant="ghost"
            size="sm"
            icon={<History size={18} />}
            className="!text-indigo-600 hover:!bg-indigo-50"
            onClick={() => onToggleHistory(true)}
            title="Ver equipos eliminados"
          >
            Ver Bajas
          </Button>
          <Button
            variant="add"
            size="sm"
            icon={<Plus size={18} />}
            onClick={onAddNew}
          >
            Añadir Equipo
          </Button>
        </>
      )}
    </div>
  </div>
);

const ActiveToggle = ({
  active,
  hasMembers,
  onChange,
}: {
  active: boolean;
  hasMembers: boolean | null;
  onChange: () => void;
}) => (
  <div className="flex flex-col gap-1 py-2">
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={active}
        aria-label="Alternar estado activo del equipo"
        onClick={() => {
          //Si tiene miembros y está activo, no permitimos ponerlo como inactivo
          if (hasMembers && active) {
            alert(
              "No puedes desactivar un equipo que tiene integrantes activos. Primero debes quitarlos del equipo.",
            );
            return;
          }
          onChange();
        }}
        className={`w-10 h-5 rounded-full relative transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${active ? "bg-indigo-600" : "bg-gray-300"} ${hasMembers && active ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div
          className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 ${active ? "left-6" : "left-1"}`}
        />
      </button>
      <span className="text-xs font-bold text-gray-700 uppercase">
        {active ? "Equipo Activo" : "Equipo Inactivo"}
      </span>
    </div>
    {/* Mensaje de ayuda visual si el equipo tiene miembros */}
    {hasMembers && active && (
      <p className="text-[10px] text-amber-600 font-medium ml-1">
        * No se puede desactivar: tiene integrantes vinculados.
      </p>
    )}
  </div>
);

const TeamsSection = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isHistoryMode, setIsHistoryMode] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
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

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    active: true,
  });

  useEffect(() => {
    fetchTeams();
  }, [isHistoryMode]);

  const fetchTeams = async () => {
    try {
      const resp = isHistoryMode
        ? await teamService.getDeletedHistory()
        : await teamService.getAll();
      setTeams(resp.data);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (team: Team) => {
    setSelectedTeam(team);
    setIsViewOpen(true);
  };
  const handleAddNew = () => {
    setSelectedTeam(null);
    setFormData({ name: "", description: "", active: true });
    setIsFormOpen(true);
  };
  const handleEdit = (team: Team) => {
    setSelectedTeam(team);
    setFormData({
      name: team.name,
      description: team.description,
      active: team.active,
    });
    setIsFormOpen(true);
  };
  const handleSaveTrigger = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setConfirmConfig({ isOpen: true, type: "save", data: formData });
  };
  const handleDeleteTrigger = (id: number) => {
    setConfirmConfig({ isOpen: true, type: "delete", data: id });
  };

  const executeSave = async () => {
    selectedTeam
      ? await teamService.update(selectedTeam.id, confirmConfig.data)
      : await teamService.create(confirmConfig.data);
    setSuccessConfig({
      isOpen: true,
      title: "¡Éxito!",
      desc: "La información del equipo se ha actualizado correctamente.",
    });
  };

  const executeDelete = async () => {
    await teamService.delete(confirmConfig.data);
    setSuccessConfig({
      isOpen: true,
      title: "Equipo eliminado",
      desc: "El equipo y sus afiliaciones han sido retirados.",
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
    } finally {
      setFormLoading(false);
    }
  };

  const hasMembers = selectedTeam && (selectedTeam.memberCount || 0) > 0;

  return (
    <div className="space-y-6">
      {/* CABECERA DINÁMICA */}
      <TeamsSectionHeader
        isHistoryMode={isHistoryMode}
        onToggleHistory={setIsHistoryMode}
        onAddNew={handleAddNew}
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.length > 0 ? (
            teams.map((t) => (
              <TeamCard
                key={t.id}
                team={t}
                onView={handleView}
                // Pasamos undefined si estamos en historial para ocultar acciones
                onEdit={isHistoryMode ? undefined : handleEdit}
                onDelete={isHistoryMode ? undefined : handleDeleteTrigger}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border-2 border-dashed border-gray-100 text-gray-400 italic text-sm">
              {isHistoryMode
                ? "No hay equipos en la papelera."
                : "No hay equipos registrados."}
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Detalles del Equipo"
        size="sm"
      >
        {selectedTeam && <TeamDetails team={selectedTeam} />}
      </Modal>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedTeam ? "Editar Equipo" : "Nuevo Equipo"}
      >
        <form onSubmit={handleSaveTrigger} className="space-y-4">
          <div>
            <label
              htmlFor="teamName"
              className="text-[10px] font-bold text-gray-400 uppercase ml-1"
            >
              Nombre del Equipo<span className="text-red-500">*</span>
            </label>
            <input
              id="teamName"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Escribe aquí el nombre del equipo"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="text-[10px] font-bold text-gray-400 uppercase ml-1"
            >
              Descripción
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe a este equipo..."
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm min-h-[100px]"
            />
          </div>

          {/* Toggle de Estado Activo */}
          <ActiveToggle
            active={formData.active}
            hasMembers={!!hasMembers}
            onChange={() =>
              setFormData((prev) => ({ ...prev, active: !prev.active }))
            }
          />

          <div className="flex justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsFormOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar Equipo
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={executeAction}
        title="¿Confirmar acción?"
        description={
          confirmConfig.type === "delete"
            ? "Esto eliminará el equipo y todas sus afiliaciones."
            : "¿Guardar cambios?"
        }
        type={confirmConfig.type === "delete" ? "danger" : "warning"}
        isLoading={formLoading}
      />
      <SuccessDialog
        isOpen={successConfig.isOpen}
        onClose={() => {
          setSuccessConfig({ ...successConfig, isOpen: false });
          setIsFormOpen(false);
          fetchTeams();
        }}
        title={successConfig.title}
        description={successConfig.desc}
      />
    </div>
  );
};

export default TeamsSection;
