import React from "react";
import { Users2, Edit2, Trash2, Eye } from "lucide-react";
import Button from "../../../components/shared/Button";
import { type Team } from "../services/team.service";

interface TeamCardProps {
  team: Team;
  onView: (team: Team) => void;
  onEdit?: (team: Team) => void;
  onDelete?: (id: number) => void;
}



const TeamCard = ({ team, onView, onEdit, onDelete }: TeamCardProps) => {
  const hasMembers = (team.memberCount || 0) > 0;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${team.active ? "bg-indigo-500" : "bg-gray-300"}`}
      />

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${team.active ? "bg-indigo-50 text-indigo-600" : "bg-gray-50 text-gray-400"}`}
          >
            <Users2 size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight line-clamp-1">
              {team.name}
            </h3>
            <p className="text-[10px] text-gray-400 font-medium">
              ID Equipo: #{team.id}
            </p>
          </div>
        </div>

        {/* BOTONES ACCIÓN */}
        <div className="flex items-center gap-1 ">
          {/* El botón de ver siempre está, porque onView es obligatoria */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(team)}
            className="!text-blue-500 hover:!bg-blue-50"
            title="Ver detalles"
          >
            <Eye size={16} />
          </Button>

          {/* SOLO si existe onEdit (No estamos en historial) */}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(team)}
              className="!text-amber-500 hover:!bg-amber-50"
              title="Editar equipo"
            >
              <Edit2 size={16} />
            </Button>
          )}

          {/* SOLO si existe onDelete (No estamos en historial) */}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(team.id)}
              disabled={hasMembers}
              className="!text-red-500 hover:!bg-red-50"
              title={
                hasMembers
                  ? "Los equipos con miembros no se pueden eliminar"
                  : "Eliminar equipo"
              }
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 italic">
          {team.description || "Sin descripción definida."}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Número de integrantes:
          </span>
          <div className="flex items-center gap-1.5">
            {hasMembers ? (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full">
                <Users2 size={10} className="text-indigo-500" />
                <span className="text-[10px] font-black uppercase">
                  {team.memberCount} {team.memberCount === 1 ? 'Integrante' : 'Integrantes'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-400 border border-gray-100 rounded-full">
                <Users2 size={10} />
                <span className="text-[10px] font-bold uppercase tracking-tight">Vacío</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
