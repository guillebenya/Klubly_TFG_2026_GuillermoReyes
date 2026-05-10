import { Users2, Edit2, Trash2, Eye } from "lucide-react";
import Button from "../../../components/shared/Button";
import Badge from "../../../components/shared/Badge"; // Importado
import Card from "../../../components/shared/Card";   // Importado
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
    <Card className={`!p-5 shadow-sm hover:shadow-md group relative overflow-hidden transition-all border-l-4 border-l-indigo-300 hover:border-indigo-600 ${team.active ? '' : 'opacity-65'}`}>
      {/* Barra lateral de estado */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(team)}
            className="!text-blue-500 hover:!bg-blue-50"
            title="Ver detalles"
          >
            <Eye size={16} />
          </Button>

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
            {/* Adaptado uso de Badge */}
            {hasMembers ? (
              <Badge 
                variant="indigo" 
                icon={<Users2 size={10} />}
                className="rounded-full px-2.5 py-1 !font-black !uppercase"
              >
                {team.memberCount} {team.memberCount === 1 ? 'Integrante' : 'Integrantes'}
              </Badge>
            ) : (
              <Badge 
                variant="gray" 
                icon={<Users2 size={10} />}
                className="rounded-full px-2.5 py-1 !font-bold !uppercase !tracking-tight !text-gray-400"
              >
                Vacío
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TeamCard;