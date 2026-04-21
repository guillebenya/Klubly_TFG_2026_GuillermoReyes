import React from "react";
import {
  User as UserIcon,
  Mail,
  Users,
  Eye,
  Edit2,
  Trash2,
  ShieldCheck,
  ClipboardList,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Card from "../../../components/shared/Card";
import Badge from "../../../components/shared/Badge";
import Button from "../../../components/shared/Button";
import { authService } from "../../auth/services/auth.service";

interface MemberCardProps {
  member: any;
  onView: (member: any) => void;
  onEdit: (member: any) => void;
  onDelete: (id: number) => void;
  isStaffView?: boolean;
  commonTeamsCount?: number;
}

const MemberCard = ({
  member,
  onView,
  onEdit,
  onDelete,
  isStaffView = false,
  commonTeamsCount = 0,
}: MemberCardProps) => {
  // Lógica para elegir el icono del Rol
  const getRoleIcon = (role: string) => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return <ShieldCheck size={10} />;
      case "STAFF":
        return <ClipboardList size={10} />;
      default:
        return <UserIcon size={10} />;
    }
  };

  //Para comprobar si el usuario actual es Admin y mostrar el botón de editar y eliminar solo a ellos
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.roleName === "ADMIN";

  return (
    <Card className="flex items-center gap-4 py-3 px-6 hover:border-indigo-300 transition-all shadow-sm">
      {/* Avatar */}
      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-indigo-50 shrink-0">
        {member.avatarURL ? (
          <img
            src={member.avatarURL}
            alt={"Avatar"}
            className="h-full w-full object-cover"
          />
        ) : (
          <UserIcon className="text-gray-500" size={24} />
        )}
      </div>

      {/* Información en Fila */}
      <div className="flex items-center justify-between flex-1 min-w-0 gap-4">
        {/* Nombre y Email */}
        <div className="flex flex-col min-w-[180px]">
          <p className="text-sm font-bold text-gray-900 truncate">
            {member.firstName} {member.lastName}
          </p>
          <div className="flex items-center gap-1 text-gray-400 whitespace-nowrap">
            <Mail size={12} />
            <span className="text-xs truncate">{member.email}</span>
          </div>
        </div>

        {/* Username */}
        <div className="hidden md:flex flex-col items-start min-w-[100px]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
            Nombre Usuario
          </span>
          <p className="text-xs font-semibold text-gray-600 truncate">
            {member.username}
          </p>
        </div>

        {/* Teléfono */}
        <div className="hidden md:flex flex-col items-start min-w-[100px]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
            Teléfono
          </span>
          <p className="text-xs font-semibold text-gray-600 truncate">
            {member.phone || "No disponible"}
          </p>
        </div>

        {/* Rol con Icono Dinámico */}
        <div className="hidden md:flex flex-col items-start min-w-[100px]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
            Rol
          </span>
          <Badge variant="indigo" icon={getRoleIcon(member.roleName)}>
            {member.roleName || "MEMBER"}
          </Badge>
        </div>

        {/* Estado con Icono de Check o X */}
        <div className="hidden sm:flex flex-col items-start min-w-[90px]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
            Estado
          </span>
          <Badge
            variant={member.active ? "green" : "red"}
            icon={
              member.active ? <CheckCircle2 size={10} /> : <XCircle size={10} />
            }
          >
            {member.active ? "ACTIVO" : "INACTIVO"}
          </Badge>
        </div>

        {/* Cargo Club */}
        <div className="hidden lg:flex flex-col min-w-[120px]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
            Cargo Institucional
          </span>
          <p className="text-xs font-semibold text-gray-600 truncate">
            {member.clubPosition || "Socio"}
          </p>
        </div>

        {/* Equipos - Resumen Dinámico */}
        <div className="hidden xl:flex flex-col min-w-[110px]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">
            {isStaffView ? "Equipos en común" : "Nº Equipos"}
          </span>
          <div className="flex items-center gap-1.5">
            {/* Verificamos el conteo según el rol: commonTeamsCount para Staff, affiliations para Admin */}
            {((isStaffView ? commonTeamsCount : member.affiliations?.length) ||
              0) > 0 ? (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full">
                <Users size={10} className="text-indigo-500" />
                <span className="text-[10px] font-black">
                  {isStaffView ? commonTeamsCount : member.affiliations.length}{" "}
                  {(isStaffView
                    ? commonTeamsCount
                    : member.affiliations.length) === 1
                    ? "EQUIPO"
                    : "EQUIPOS"}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-400 border border-gray-100 rounded-full">
                <Users size={10} />
                <span className="text-[10px] font-bold uppercase">Ninguno</span>
              </div>
            )}
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
          className="!text-blue-600 hover:!bg-blue-50"
        />
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            icon={<Edit2 size={16} />}
            onClick={() => onEdit(member)}
            className="!text-amber-500 hover:!bg-amber-50"
          />
        )}
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 size={16} />}
            onClick={() => onDelete(member.id)}
            className="!text-red-500 hover:!bg-red-50"
          />
        )}
      </div>
    </Card>
  );
};

export default MemberCard;
