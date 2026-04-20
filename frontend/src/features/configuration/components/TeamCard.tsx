// src/features/configuration/components/TeamCard.tsx
import React from "react";
import { Users2, Edit2, Trash2, Eye } from "lucide-react";
import Button from "../../../components/shared/Button";
import { type Team } from "../services/team.service";

interface TeamCardProps {
  team: Team;
  onView: (team: Team) => void;
  onEdit: (team: Team) => void;
  onDelete: (id: number) => void;
}

const TeamCard = ({ team, onView, onEdit, onDelete }: TeamCardProps) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${team.active ? "bg-indigo-500" : "bg-gray-300"}`} />

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${team.active ? "bg-indigo-50 text-indigo-600" : "bg-gray-50 text-gray-400"}`}>
            <Users2 size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight line-clamp-1">
              {team.name}
            </h3>
            <p className="text-[10px] text-gray-400 font-medium">ID Equipo: #{team.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" onClick={() => onView(team)} className="!text-blue-500 hover:!bg-blue-50">
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(team)} className="!text-amber-500 hover:!bg-amber-50">
            <Edit2 size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(team.id)} className="!text-red-500 hover:!bg-red-50">
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 italic">
          {team.description || "Sin descripción definida."}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Miembros actuales</span>
          <span className={`text-xs font-black px-3 py-1 rounded-full ${team.memberCount && team.memberCount > 0 ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-400'}`}>
            {team.memberCount || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;