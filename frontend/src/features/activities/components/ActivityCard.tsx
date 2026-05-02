import React, { useState } from "react";
import { 
  Eye, 
  Pencil, 
  Trash2, 
  Calendar, 
  MapPin, 
  Users, 
  UserPlus, 
  CheckCircle2,
  XCircle
} from "lucide-react";
import Button from "../../../components/shared/Button";
import Badge from "../../../components/shared/Badge";
import Card from "../../../components/shared/Card"; 
import { type Activity } from "../services/activity.service";
import { registrationService } from "../services/registration.service";

interface ActivityCardProps {
  activity: Activity;
  onView: (activity: Activity) => void;
  onEdit?: (activity: Activity) => void;
  onDelete?: (id: number) => void;
  isMember?: boolean;
  onRefresh: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onView,
  onEdit,
  onDelete,
  isMember,
  onRefresh,
}) => {
  const [loadingAction, setLoadingAction] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isFull = activity.registeredCount >= activity.capacity;

  const handleRegister = async () => {
    try {
      setLoadingAction(true);
      await registrationService.registerSelf(activity.id);
      onRefresh();
    } catch (error) {
      console.error("Error al inscribirse");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <Card 
      className={`flex flex-col lg:flex-row items-center w-full gap-4 !p-4 border-l-4 border-l-indigo-300 hover:border-indigo-600 transition-all ${activity.active ? '' : 'opacity-65'}`}
    >
      {/* ICONO DE ACTIVIDAD */}
      <div className="flex-shrink-0 p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
        <Calendar size={24} />
      </div>

      {/* NOMBRE - Flex más alto para dar prioridad al texto largo */}
      <div className="flex-[2] min-w-0 w-full lg:w-auto">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Actividad</span>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-gray-800 truncate" title={activity.name}>
            {activity.name}
          </h3>
        </div>
      </div>

      {/* FECHA */}
      <div className="flex-1 min-w-0 w-full lg:w-auto">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Fecha y Hora</span>
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar size={14} className="text-indigo-500 flex-shrink-0" />
          <span className="text-xs font-medium">{formatDate(activity.startDate)}</span>
        </div>
      </div>

      {/* UBICACIÓN */}
      <div className="flex-1 min-w-0 w-full lg:w-auto">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Ubicación</span>
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin size={14} className="text-indigo-500 flex-shrink-0" />
          <span className="text-xs font-medium truncate" title={activity.location}>
            {activity.location || "Ubicación por definir"}
          </span>
        </div>
      </div>

      {/* EQUIPOS */}
      <div className="flex-[1.2] min-w-0 w-full lg:w-auto">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Equipo/s Relacionado/s</span>
        <div className="flex flex-wrap gap-1 items-center">
          {activity.teamNames.length > 0 ? (
            activity.teamNames.map((team, idx) => (
              <Badge key={idx} variant="indigo">{team}</Badge>
            ))
          ) : (
            <Badge variant="gray">Global</Badge>
          )}
        </div>
      </div>

      {/* CUPO */}
      <div className="flex-[0.7] min-w-0 w-full lg:w-auto">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Inscritos</span>
        <div className="flex items-center gap-2">
          <Users size={14} className={isFull ? 'text-red-500' : 'text-emerald-500'} />
          <span className={`text-xs font-bold ${isFull ? 'text-red-500' : 'text-emerald-600'}`}>
            {activity.registeredCount}/{activity.capacity}
          </span>
        </div>
      </div>

      {/* ESTADO */}
      <div className="flex-[0.7] min-w-0 w-full lg:w-auto">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
          Estado
        </span>
        <Badge
          variant={activity.active ? "green" : "red"}
          icon={activity.active ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
        >
          {activity.active ? "ACTIVO" : "INACTIVO"}
        </Badge>
      </div>

      {/* ACCIONES */}
      <div className="flex-shrink-0 flex items-center gap-2 w-full lg:w-auto justify-end pt-3 lg:pt-0">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="!text-blue-600 hover:!bg-blue-50"
            icon={<Eye size={16} />}
            onClick={() => onView(activity)}
          />
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="!text-amber-600 hover:!bg-amber-50"
              icon={<Pencil size={16} />}
              onClick={() => onEdit(activity)}
            />
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="!text-red-600 hover:!bg-red-50"
              icon={<Trash2 size={16} />}
              onClick={() => onDelete(activity.id)}
            />
          )}
        </div>

        {isMember && (
          <div className="ml-2">
            {!isFull ? (
              <Button
                variant="add"
                size="sm"
                className="whitespace-nowrap px-4"
                icon={<UserPlus size={18} />}
                onClick={handleRegister}
                isLoading={loadingAction}
              >
                Apuntarse
              </Button>
            ) : (
              <Badge variant="red" textSize= "mediano" className="py-1 px-11">Lleno</Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ActivityCard;