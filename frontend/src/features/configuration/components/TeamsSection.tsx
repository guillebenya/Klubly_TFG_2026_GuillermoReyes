// src/features/configuration/components/TeamsSection.tsx
import React, { useEffect, useState } from "react";
import { Users2, Plus, Loader2 } from "lucide-react";
import Button from "../../../components/shared/Button";
import Modal from "../../../components/shared/Modal";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import SuccessDialog from "../../../components/shared/SuccessDialog";
import TeamCard from "./TeamCard";
import TeamDetails from "./TeamDetails";
import { teamService, type Team } from "../services/team.service";

const TeamsSection = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

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
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const resp = await teamService.getAll();
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
  const handleSaveTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmConfig({ isOpen: true, type: "save", data: formData });
  };
  const handleDeleteTrigger = (id: number) => {
    setConfirmConfig({ isOpen: true, type: "delete", data: id });
  };

  const executeAction = async () => {
    try {
      setFormLoading(true);
      if (confirmConfig.type === "delete") {
        await teamService.delete(confirmConfig.data);
        setSuccessConfig({
          isOpen: true,
          title: "Equipo eliminado",
          desc: "El equipo y sus afiliaciones han sido retirados.",
        });
      } else {
        selectedTeam
          ? await teamService.update(selectedTeam.id, confirmConfig.data)
          : await teamService.create(confirmConfig.data);
        setSuccessConfig({
          isOpen: true,
          title: "¡Éxito!",
          desc: "La información del equipo se ha actualizado correctamente.",
        });
      }
      setConfirmConfig({ ...confirmConfig, isOpen: false });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Users2 size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tight">
              Listado de Equipos
            </h3>
            <p className="text-[10px] text-gray-400 font-medium">
              Administra los equipos del club.
            </p>
          </div>
        </div>
        <Button
          variant="add"
          size="sm"
          icon={<Plus size={18} />}
          onClick={handleAddNew}
        >
          Añadir Equipo
        </Button>
      </div>

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
                onEdit={handleEdit}
                onDelete={handleDeleteTrigger}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-400 italic text-sm">
              No hay equipos registrados.
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
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
              Nombre del Equipo
            </label>
            <input
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm min-h-[100px]"
            />
          </div>
          <div className="flex items-center gap-3 py-2">
            <div
              onClick={() =>
                setFormData({ ...formData, active: !formData.active })
              }
              className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${formData.active ? "bg-indigo-600" : "bg-gray-300"}`}
            >
              <div
                className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.active ? "left-6" : "left-1"}`}
              />
            </div>
            <span className="text-xs font-bold text-gray-700 uppercase">
              Equipo Activo
            </span>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
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
