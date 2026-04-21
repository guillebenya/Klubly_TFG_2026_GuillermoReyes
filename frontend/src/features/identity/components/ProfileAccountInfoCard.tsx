import React from "react";
import { AtSign, Mail } from "lucide-react";
import Card from "../../../components/shared/Card";

interface ProfileAccountInfoCardProps {
  user: any;
}

const ProfileAccountInfoCard = ({ user }: ProfileAccountInfoCardProps) => {
  return (
    <div className="space-y-4">
      {/* Título 3: Información de Cuenta */}
      <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight ml-1">
        Información de Cuenta
      </h2>

      {/* Contenido: Card fija con Username y Email */}
      <Card className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Bloque Nombre de Usuario */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <AtSign size={14} className="text-indigo-500" /> 
            Nombre de Usuario
          </label>
          <p className="text-sm font-bold text-gray-700">
            {user?.username}
          </p>
        </div>

        {/* Bloque Email */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Mail size={14} className="text-indigo-500" /> 
            Email de la cuenta
          </label>
          <p className="text-sm font-bold text-gray-700 break-all">
            {user?.email}
          </p>
        </div>

      </Card>
    </div>
  );
};

export default ProfileAccountInfoCard;