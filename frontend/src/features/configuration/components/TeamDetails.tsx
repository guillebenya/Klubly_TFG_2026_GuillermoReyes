// src/features/configuration/components/TeamDetails.tsx
import React from "react";
import { Users2, Calendar, Clock, Trash2, Info } from "lucide-react";
import Badge from "../../../components/shared/Badge";
import { type Team } from "../services/team.service";

interface TeamDetailsProps {
  team: Team;
}

const TeamDetails = ({ team }: TeamDetailsProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Users2 size={28} />
          </div>
          <div>
            <h4 className="text-xl font-black text-gray-900 leading-tight">
              {team.name}
            </h4>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter mt-1">
              Ficha técnica del equipo
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={team.active ? "green" : "red"}>
            {team.active ? "ACTIVO" : "INACTIVO"}
          </Badge>
          <div className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-black text-indigo-600 shadow-sm uppercase">
            {team.memberCount || 0}{" "}
            {team.memberCount === 1 ? "Integrante" : "Integrantes"}
          </div>
        </div>
      </div>

      <div className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
          <Info size={12} /> Descripción y Notas
        </label>
        <p className="text-sm font-medium text-gray-600 leading-relaxed italic bg-slate-50 p-4 rounded-lg border border-slate-100">
          "{team.description || "No hay descripción disponible."}"
        </p>
      </div>

      <div className="p-4 bg-slate-900 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Calendar size={10} /> Creado el
          </span>
          <span className="text-[11px] font-medium text-white mt-1">
            {formatDate(team.createdAt)}
          </span>
        </div>
        <div className="flex flex-col border-t border-slate-800 sm:border-t-0 sm:border-l sm:pl-4 pt-3 sm:pt-0">
          <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Clock size={10} /> Último cambio
          </span>
          <span className="text-[11px] font-medium text-white mt-1">
            {formatDate(team.updatedAt)}
          </span>
        </div>
        <div className="flex flex-col border-t border-slate-800 sm:border-t-0 sm:border-l sm:pl-4 pt-3 sm:pt-0">
          <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Trash2 size={10} /> Eliminado el
          </span>
          <span
            className={`text-[11px] font-medium mt-1 ${team.deletedAt ? "text-red-400" : "text-slate-500 italic"}`}
          >
            {team.deletedAt
              ? formatDate(team.deletedAt)
              : "Este equipo no ha sido eliminado"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TeamDetails;
