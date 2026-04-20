import React, { useState, useEffect } from "react";
import { Users, Plus, Trash2, Shield } from "lucide-react";
import Button from "../../../components/shared/Button";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import SuccessDialog from "../../../components/shared/SuccessDialog";
import { teamService } from "../services/team.service";
import { affiliationService } from "../services/affiliation.service";

interface MemberTeamsManagerProps {
  member: any;
  onRefresh: () => void;
}

const MemberTeamsManager = ({ member, onRefresh }: MemberTeamsManagerProps) => {
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [newAffiliation, setNewAffiliation] = useState({
    teamId: "",
    teamPosition: "",
  });

  //ESTADOS PARA DIÁLOGOS
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    type: "add" | "delete";
    data?: any;
  }>({
    isOpen: false,
    type: "add",
  });

  const [successConfig, setSuccessConfig] = useState({
    isOpen: false,
    title: "",
    desc: "",
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const resp = await teamService.getAll();
      setAllTeams(resp.data);
    } catch (error) {
      console.error("Error cargando equipos:", error);
    }
  };

  //TRIGGERS

  const handleAddTrigger = () => {
    if (!newAffiliation.teamId || !newAffiliation.teamPosition) {
      alert("Por favor, selecciona un equipo y una posición.");
      return;
    }
    setConfirmConfig({ isOpen: true, type: "add" });
  };

  const handleDeleteTrigger = (id: number) => {
    setConfirmConfig({ isOpen: true, type: "delete", data: id });
  };

  //EJECUCIÓN

  const executeAction = async () => {
    setLoading(true);
    try {
      if (confirmConfig.type === "add") {
        // Ejecutar Alta
        await affiliationService.create({
          userId: Number(member.id),
          teamId: Number(newAffiliation.teamId),
          teamPosition: newAffiliation.teamPosition,
        });

        setNewAffiliation({ teamId: "", teamPosition: "" });
        setSuccessConfig({
          isOpen: true,
          title: "Fichaje realizado",
          desc: "El miembro ha sido vinculado al equipo correctamente.",
        });
      } else {
        // Ejecutar Baja
        await affiliationService.delete(confirmConfig.data);
        setSuccessConfig({
          isOpen: true,
          title: "Afiliación eliminada",
          desc: "Se ha retirado al miembro del equipo seleccionado.",
        });
      }

      setConfirmConfig({ ...confirmConfig, isOpen: false });
    } catch (err: any) {
      console.error("Error en la operación:", err);
      alert("Hubo un problema al procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessConfig({ ...successConfig, isOpen: false });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* LISTA ACTUAL */}
      <div className="space-y-3">
        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Equipos actuales
        </h5>
        {member.affiliations?.length > 0 ? (
          member.affiliations.map((aff: any) => (
            <div
              key={aff.id}
              className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl border border-indigo-100"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm">
                  <Shield size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    {aff.teamName}
                  </p>
                  <p className="text-[10px] text-indigo-600 font-bold uppercase">
                    {aff.teamPosition}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteTrigger(aff.id)}
                className="text-red-500 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-400 italic text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            Sin equipos asignados
          </p>
        )}
      </div>

      <hr className="border-gray-100" />

      {/* FORMULARIO PARA AÑADIR */}
      <div className="space-y-3">
        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Añadir a un equipo
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={newAffiliation.teamId}
            onChange={(e) =>
              setNewAffiliation({ ...newAffiliation, teamId: e.target.value })
            }
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Seleccionar Equipo...</option>
            {allTeams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <input
            placeholder="Ej: Delantero, Entrenador..."
            value={newAffiliation.teamPosition}
            onChange={(e) =>
              setNewAffiliation({
                ...newAffiliation,
                teamPosition: e.target.value,
              })
            }
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <Button
          variant="primary"
          className="w-full"
          icon={<Plus size={18} />}
          onClick={handleAddTrigger} // Cambiado a Trigger
          isLoading={loading}
          disabled={!newAffiliation.teamId || !newAffiliation.teamPosition}
        >
          Confirmar Fichaje
        </Button>
      </div>

      {/* DIÁLOGOS DE CONFIRMACIÓN Y ÉXITO */}

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={executeAction}
        title="¿Confirmar acción?"
        description={
          confirmConfig.type === "add"
            ? "¿Estás seguro de que deseas vincular a este miembro al equipo seleccionado?"
            : "¿Deseas eliminar esta afiliación? El miembro dejará de pertenecer a este equipo."
        }
        confirmLabel={
          confirmConfig.type === "add"
            ? "Confirmar Fichaje"
            : "Eliminar Afiliación"
        }
        type={confirmConfig.type === "delete" ? "danger" : "info"}
        isLoading={loading}
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

export default MemberTeamsManager;
