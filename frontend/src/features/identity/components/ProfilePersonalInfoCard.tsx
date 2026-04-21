import React from "react";
import { User, Phone, Pencil } from "lucide-react";
import Card from "../../../components/shared/Card";

interface ProfilePersonalInfoCardProps {
  user: any;
  onEditPersonal: () => void;
}

const ProfilePersonalInfoCard = ({
  user,
  onEditPersonal,
}: ProfilePersonalInfoCardProps) => {
  return (
    <div className="space-y-4">
      {/* Título 2: Información Personal */}
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight ml-1">
          Información Personal
        </h2>
        <button
          onClick={onEditPersonal}
          className="p-1.5 bg-yellow-50 text-yellow-600 rounded-3xl shadow-xl border border-gray-100 hover:bg-yellow-600 hover:text-white transition-all active:scale-90"
          title="Editar información personal"
        >
          <Pencil size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Contenido: Card con Nombre y Teléfono */}
      <Card className="grid grid-cols-1 md:grid-cols-2 gap-32 w-fit">
        {/* Bloque Nombre y Apellidos */}
        <div className="space-y-1.5 min-w-[100px]">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <User size={14} className="text-indigo-500" />
            Nombre y Apellidos
          </label>
          <p className="text-base font-bold text-gray-700 break-words">
            {user?.firstName} {user?.lastName}
          </p>
        </div>

        {/* Bloque Teléfono */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Phone size={14} className="text-indigo-500" />
            Teléfono
          </label>
          <p className="text-base font-bold text-gray-700">
            {user?.phone || "No definido"}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePersonalInfoCard;
