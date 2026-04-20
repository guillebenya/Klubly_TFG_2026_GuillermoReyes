import React from "react";
import {
  User as UserIcon,
  Mail,
  Users,
  Eye,
  Edit2,
  Trash2,
  ShieldCheck,
  User,
  ClipboardList,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Card from "../../../components/shared/Card";
import Badge from "../../../components/shared/Badge";
import Button from "../../../components/shared/Button";

interface MemberCardProps {
  member: any;
  onView: (member: any) => void;
  onEdit: (member: any) => void;
  onDelete: (id: number) => void;
}

const MemberCard = ({ member, onView, onEdit, onDelete }: MemberCardProps) => {

  // Lógica para elegir el icono del Rol
  const getRoleIcon = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN': return <ShieldCheck size={10} />;
      case 'STAFF': return <ClipboardList size={10} />;
      default: return <User size={10} />;
    }
  };
  
  return (
    <Card className="flex items-center gap-4 py-3 px-6 hover:border-indigo-300 transition-all shadow-sm">
      {/* 1. Avatar (Más pequeño para ahorrar espacio) */}
      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border border-indigo-50 shrink-0">
        {member.avatarUrl ? (
          <img
            src={member.avatarUrl}
            alt={member.username}
            className="h-full w-full object-cover"
          />
        ) : (
          <UserIcon className="text-indigo-400" size={24} />
        )}
      </div>

      {/* 2. Información en Fila (Flex-1 para ocupar el resto) */}
      <div className="flex items-center justify-between flex-1 min-w-0 gap-4">
        {/* Nombre y Email - No rompe línea */}
        <div className="flex flex-col min-w-[180px]">
          <p className="text-sm font-bold text-gray-900 truncate">
            {member.firstName} {member.lastName}
          </p>
          <div className="flex items-center gap-1 text-gray-400 whitespace-nowrap">
            <Mail size={12} />
            <span className="text-xs truncate">{member.email}</span>
          </div>
        </div>

        {/* Rol con Icono Dinámico */}
        <div className="hidden md:flex flex-col items-start min-w-[100px]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Rol</span>
          <Badge 
            variant="indigo" 
            icon={getRoleIcon(member.roleName)}
          >
            {member.roleName || 'MEMBER'}
          </Badge>
        </div>

        {/* Estado con Icono de Check o X */}
        <div className="hidden sm:flex flex-col items-start min-w-[90px]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Estado</span>
          <Badge 
            variant={member.active ? 'green' : 'red'}
            icon={member.active ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
          >
            {member.active ? 'ACTIVO' : 'INACTIVO'}
          </Badge>
        </div>

        {/* Cargo Club - Texto corto */}
        <div className="hidden lg:flex flex-col min-w-[120px]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
            Cargo
          </span>
          <p className="text-xs font-semibold text-gray-600 truncate">
            {member.clubPosition || "Socio"}
          </p>
        </div>

        {/* Equipos - Resumen */}
        <div className="hidden xl:flex flex-col min-w-[100px]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
            Equipos
          </span>
          <div className="flex items-center gap-1 text-gray-500">
            <Users size={12} />
            <span className="text-xs font-medium">Ver más...</span>
          </div>
        </div>
      </div>

      {/* 3. Acciones con los colores solicitados */}
      <div className="flex items-center gap-1 shrink-0 ml-4">
        <Button
          variant="ghost"
          size="sm"
          icon={<Eye size={16} />}
          onClick={() => onView(member)}
          className="!text-blue-600 hover:!bg-blue-50" // El ! asegura que gane este color
        />
        <Button
          variant="ghost"
          size="sm"
          icon={<Edit2 size={16} />}
          onClick={() => onEdit(member)}
          className="!text-amber-500 hover:!bg-amber-50"
        />
        <Button
          variant="ghost"
          size="sm"
          icon={<Trash2 size={16} />}
          onClick={() => onDelete(member.id)}
          className="!text-red-500 hover:!bg-red-50"
        />
      </div>
    </Card>
  );
};

export default MemberCard;
