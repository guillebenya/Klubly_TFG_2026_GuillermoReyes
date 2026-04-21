import React from "react";
import { User, Phone } from "lucide-react";
import Card from "../../../components/shared/Card";

interface ProfilePersonalInfoCardProps {
  user: any;
}

const ProfilePersonalInfoCard = ({ user }: ProfilePersonalInfoCardProps) => {
  return (
    <div className="space-y-4">
      {/* Título 2: Información Personal */}
      <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight ml-1">
        Información Personal
      </h2>

      {/* Contenido: Card con Nombre y Teléfono */}
      <Card className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Bloque Nombre y Apellidos */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <User size={14} className="text-indigo-500" /> 
            Nombre y Apellidos
          </label>
          <p className="text-base font-bold text-gray-700">
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