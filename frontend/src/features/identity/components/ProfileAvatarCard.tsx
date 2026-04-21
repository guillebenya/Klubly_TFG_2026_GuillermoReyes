import React from "react";
import { User, Pencil, UserIcon } from "lucide-react";
import Card from "../../../components/shared/Card";
import Badge from "../../../components/shared/Badge";

interface ProfileAvatarCardProps {
  user: any;
  onEditAvatar: () => void;
}

const ProfileAvatarCard = ({ user, onEditAvatar }: ProfileAvatarCardProps) => {
  return (
    <div className="space-y-4">
      {/* Titulo 1: Mi Perfil */}
      <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight ml-1">
        Mi Perfil
      </h2>

      {/* Contenido: Card con avatar, nombre y rol */}
      <Card className="flex flex-row items-center text-center gap-12 p-8 w-fit">
        
        {/* Contenedor del Avatar */}
        <div className="relative group">
          <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center text-white shadow-2xl shadow-indigo-100 overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]">
            {user?.avatarURL ? (
              <img 
                src={user.avatarURL} 
                alt="Foto de perfil" 
                className="h-full w-full object-cover"
              />
            ) : (
              <UserIcon className="text-gray-500" size={80} strokeWidth={1.5} />
            )}
          </div>
          
          {/* Botón de lápiz para editar avatar */}
          <button 
            onClick={onEditAvatar}
            className="absolute -bottom-2 -right-2 p-2 bg-yellow-50 text-yellow-600 rounded-3xl shadow-xl border border-gray-100 hover:bg-yellow-600 hover:text-white transition-all active:scale-90"
            title="Cambiar foto de perfil"
          >
            <Pencil size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Información del Usuario */}
        <div className="flex flex-col items-center space-y-3">
          <h3 className="text-3xl font-black text-gray-900 tracking-tight">
            {user?.firstName} {user?.lastName}
          </h3>
          
          {/* Usamos tu componente Badge para el Rol */}
          <div className="flex justify-center">
            <Badge variant="indigo"
            className="!text-sm px-7 py-1 rounded-lg"
            >
              {user?.roleName}
            </Badge>
          </div>
        </div>
        
      </Card>
    </div>
  );
};

export default ProfileAvatarCard;