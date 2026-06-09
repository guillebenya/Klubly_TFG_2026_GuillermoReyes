import React, { useState } from "react";
import { Calendar, MapPin, Users, Clock, Settings2, Trash } from "lucide-react";
import Badge from "../../../components/shared/Badge";
import Button from "../../../components/shared/Button";
import Modal from "../../../components/shared/Modal";
import RegistrationManager from "./RegistrationManager";
import { type Activity } from "../services/activity.service";
import { authService } from "../../auth/services/auth.service";

interface ActivityDetailsProps {
  activity: Activity;
  isHistoryMode?: boolean;
  onRefresh?: () => void;
}

const ActivityDetails: React.FC<ActivityDetailsProps> = ({
  activity,
  isHistoryMode,
  onRefresh,
}) => {
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.roleName === "ADMIN";
  const isStaff = currentUser?.roleName === "STAFF";

  const [isManageOpen, setIsManageOpen] = useState(false);

  const formatDate = (dateStr?: string) =>
    dateStr ? new Date(dateStr).toLocaleString("es-ES") : "---";

  const isFull = activity.registeredCount >= activity.capacity;

  return (
    <div className="space-y-6">
      {/* INFO PRINCIPAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              Nombre de la actividad
            </span>
            <p className="text-xl font-bold text-gray-800">{activity.name}</p>
            <Badge variant={activity.active ? "green" : "red"}>
              {activity.active ? "Activa" : "Inactiva"}
            </Badge>
          </div>

          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Equipo/s Relacionado/s
            </span>
            <div className="flex flex-wrap gap-2">
              {activity.teamNames.length > 0 ? (
                activity.teamNames.map((team) => (
                  <Badge key={team} variant="indigo">
                    {team}
                  </Badge>
                ))
              ) : (
                <Badge variant="indigo">Actividad Global</Badge>
              )}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              Descripción
            </span>
            <p className="text-gray-600 leading-relaxed">
              {activity.description || "Sin descripción proporcionada."}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-2xl space-y-4 border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700">Inicio</p>
              <p className="text-sm text-gray-600">
                {formatDate(activity.startDate)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700">Fin</p>
              <p className="text-sm text-gray-600">
                {formatDate(activity.endDate)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700">Ubicación</p>
              <p className="text-sm text-gray-600">
                {activity.location || "Ubicación por definir"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: CUPO Y GESTIÓN */}
      <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-xl ${isFull ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
          >
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Inscripciones actuales
            </p>
            <p className="text-2xl font-black italic">
              {activity.registeredCount}{" "}
              <span className="text-gray-300 font-light mx-1">/</span>{" "}
              {activity.capacity}
            </p>
          </div>
        </div>

        {(isAdmin || isStaff) && !isHistoryMode && (
          <Button
            variant="secondary"
            className="!bg-yellow-400 hover:!bg-yellow-500 !text-yellow-950 font-bold shadow-sm"
            icon={<Settings2 size={18} />}
            onClick={() => setIsManageOpen(true)}
          >
            Gestionar
          </Button>
        )}
      </div>

      {/* AUDITORÍA (Solo Admin) */}
      {isAdmin && (
        <div className="bg-slate-900 rounded-2xl p-5 text-slate-400">
          <div
            className={`grid gap-4 ${isHistoryMode && activity.deletedAt ? "grid-cols-3" : "grid-cols-2"}`}
          >
            {/* Registrado el */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <Calendar size={12} />
                <span>Registrado el</span>
              </div>
              <p className="text-sm text-slate-300 font-medium">
                {activity.createdAt ? formatDate(activity.createdAt) : "---"}
              </p>
            </div>

            {/* Último cambio */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <Clock size={12} />
                <span>Último cambio</span>
              </div>
              <p className="text-sm text-slate-300 font-medium">
                {activity.updatedAt ? formatDate(activity.updatedAt) : "---"}
              </p>
            </div>

            {/* Fecha de baja (Solo en historial) */}
            {isHistoryMode && activity.deletedAt && (
              <div className="space-y-1 text-red-400/80">
                <div className="flex items-center gap-1.5 uppercase font-bold text-[10px] tracking-wider opacity-70">
                  <Trash size={12} />
                  <span>Eliminado el</span>
                </div>
                <p className="text-sm font-bold">
                  {formatDate(activity.deletedAt)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Gestión de Inscripciones */}
      <Modal
        isOpen={isManageOpen}
        onClose={() => setIsManageOpen(false)}
        title="Gestión de Inscripciones"
        size="xl"
      >
        <RegistrationManager
          activity={activity}
          onClose={() => setIsManageOpen(false)}
          onRefresh={onRefresh}
        />
      </Modal>
    </div>
  );
};

export default ActivityDetails;
