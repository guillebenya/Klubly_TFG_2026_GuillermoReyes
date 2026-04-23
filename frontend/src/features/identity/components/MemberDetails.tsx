// src/features/identity/components/MemberDetails.tsx
import React from "react";
import {
  Calendar,
  Clock,
  Mail,
  User as UserIcon,
  Shield,
  Tag,
  Users,
  Phone,
  AtSign,
  Trash2,
  Settings2,
  Image as ImageIcon,
} from "lucide-react";
import Badge from "../../../components/shared/Badge";
import { authService } from "../../auth/services/auth.service";

interface MemberDetailsProps {
  member: any;
  onManageTeams: (member: any) => void;
}

const MemberDetails = ({ member, onManageTeams }: MemberDetailsProps) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 1. Lógica de Identidad y Seguridad
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.roleName === "ADMIN";
  const staffTeamIds = currentUser?.teamIds || [];

  // 2. Filtrado de Afiliaciones: Si es Staff, solo ve las comunes
  const displayedAffiliations = isAdmin
    ? member.affiliations || []
    : (member.affiliations || []).filter((aff: any) =>
        staffTeamIds.includes(aff.teamId),
      );

  const renderValue = (value: any) =>
    value || <span className="text-gray-300 italic">No definido</span>;

  return (
    <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
      {/* CABECERA Y ESTADO */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            {member.avatarURL ? (
              <img
                src={member.avatarURL}
                alt={"Avatar"}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserIcon className="text-indigo-400" size={24} />
            )}
          </div>
          <div>
            <h4 className="text-xl font-black text-gray-900 leading-tight">
              {member.firstName} {member.lastName}
            </h4>
            <div className="flex items-center gap-2 text-gray-500 mt-1">
              <AtSign size={14} />
              <span className="text-sm font-bold">{member.username}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={member.active ? "green" : "red"}>
            {member.active ? "ACTIVO" : "INACTIVO"}
          </Badge>
          <Badge variant="indigo" icon={<Shield size={10} />}>
            {member.roleName}
          </Badge>
        </div>
      </div>

      {/* BLOQUE DE DATOS TÉCNICOS Y CONTACTO */}
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <Mail size={12} /> Email de contacto
            </label>
            <p className="text-sm font-semibold text-gray-700 break-all">
              {member.email}
            </p>
          </div>
          <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <Phone size={12} /> Teléfono
            </label>
            <p className="text-sm font-semibold text-gray-700">
              {renderValue(member.phone)}
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <ImageIcon size={12} /> Avatar URL
            </label>
            <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
              <p className="text-xs font-mono text-indigo-600 break-all leading-relaxed">
                {member.avatarURL || "N/A"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* POSICIÓN Y EQUIPOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
            <Tag size={12} /> Cargo Club
          </label>
          <p className="text-sm font-bold text-gray-700 uppercase">
            {renderValue(member.clubPosition)}
          </p>
        </div>

        <div className="md:col-span-2 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Users size={12} />
              {/* Texto dinámico según el rol del que mira */}
              {isAdmin ? "Afiliaciones actuales" : "Equipos en común"}
            </label>

            {isAdmin && (
              <button
                onClick={() => onManageTeams(member)}
                className="text-[9px] font-black flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all duration-200"
              >
                <Settings2 size={12} />
                GESTIONAR
              </button>
            )}
          </div>

          <div className="space-y-2">
            {displayedAffiliations.length > 0 ? (
              <>
                <div className="flex justify-between px-2 mb-1">
                  <span className="text-[11px] font-black text-gray-600 uppercase tracking-tighter">
                    Equipo
                  </span>
                  <span className="text-[11px] font-black text-gray-600 uppercase tracking-tighter">
                    Puesto
                  </span>
                </div>

                {displayedAffiliations.map((aff: any) => (
                  <div
                    key={aff.id}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-100 hover:bg-white hover:border-indigo-100 transition-colors group"
                  >
                    <span className="text-xs font-bold text-gray-700 group-hover:text-indigo-600">
                      {aff.teamName}
                    </span>
                    <span className="text-[10px] font-bold py-0.5 px-2 bg-indigo-100 text-indigo-700 rounded-md shadow-sm">
                      {aff.teamPosition}
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <div className="py-4 text-center border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-xs text-gray-400 italic font-medium">
                  {isAdmin
                    ? "Sin equipos asignados"
                    : "Sin equipos compartidos"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CAMPOS AUDITORÍA (Solo ADMIN) */}
      {isAdmin && (
        <div className="p-4 bg-slate-900 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Calendar size={10} /> Registrado el
            </span>
            <span className="text-[11px] font-medium text-white mt-1">
              {formatDate(member.createdAt)}
            </span>
          </div>
          <div className="flex flex-col border-t border-slate-800 sm:border-t-0 sm:border-l sm:pl-4 pt-3 sm:pt-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Clock size={10} /> Último cambio
            </span>
            <span className="text-[11px] font-medium text-white mt-1">
              {formatDate(member.updatedAt)}
            </span>
          </div>
          <div className="flex flex-col border-t border-slate-800 sm:border-t-0 sm:border-l sm:pl-4 pt-3 sm:pt-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Trash2 size={10} /> Eliminado el
            </span>
            <span
              className={`text-[11px] font-medium mt-1 ${member.deletedAt ? "text-red-400" : "text-slate-500 italic"}`}
            >
              {member.deletedAt
                ? formatDate(member.deletedAt)
                : "Este usuario no ha sido eliminado"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDetails;
