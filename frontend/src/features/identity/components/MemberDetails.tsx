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
  Info,
  Image as ImageIcon,
} from "lucide-react";
import Badge from "../../../components/shared/Badge";

interface MemberDetailsProps {
  member: any;
}

const MemberDetails = ({ member }: MemberDetailsProps) => {
  console.log("Datos del miembro recibidos:", member);
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

  const renderValue = (value: any) =>
    value || <span className="text-gray-300 italic">No definido</span>;

  return (
    <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
      {/* CABECERA Y ESTADO */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <UserIcon size={28} />
          </div>
          <div>
            <h4 className="text-xl font-black text-gray-900 leading-tight">
              {member.firstName} {member.lastName}
            </h4>
            <div className="flex items-center gap-2 text-gray-500 mt-1">
              <AtSign size={14} />
              <span className="text-sm font-bold">@{member.username}</span>
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
        {/* Fila de Email y Teléfono */}
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

        {/* Campo de Avatar URL */}
        <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <ImageIcon size={12} /> Avatar URL (String)
          </label>
          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
            <p className="text-xs font-mono text-indigo-600 break-all leading-relaxed">
              {member.avatarUrl || "N/A"}
            </p>
          </div>
        </div>
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
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
            <Users size={12} /> Afiliaciones actuales
          </label>
          <div className="space-y-2">
            {member.affiliations && member.affiliations.length > 0 ? (
              member.affiliations.map((aff: any) => (
                <div
                  key={aff.id}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <span className="text-xs font-bold text-gray-700">
                    {aff.teamName}
                  </span>
                  <span className="text-[10px] font-bold py-0.5 px-2 bg-indigo-100 text-indigo-700 rounded-md">
                    {aff.teamPosition}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic">Sin equipos</p>
            )}
          </div>
        </div>
      </div>

      {/* CAMPOS AUDITORÍA */}
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
            <Trash2 size={10} /> Baja del sistema
          </span>
          <span
            className={`text-[11px] font-medium mt-1 ${member.deletedAt ? "text-red-400" : "text-slate-500 italic"}`}
          >
            {member.deletedAt
              ? formatDate(member.deletedAt)
              : "Activo actualmente"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MemberDetails;
