// src/features/configuration/components/RoleDetails.tsx
import React from "react";
import {
  Calendar,
  Clock,
  Shield,
  Trash2,
  Info,
  Lock,
  LockOpen,
} from "lucide-react";
import Badge from "../../../components/shared/Badge";
import { type Role } from "../services/role.service";

interface RoleDetailsProps {
  role: Role;
}

const RoleDetails = ({ role }: RoleDetailsProps) => {
  // Verificamos si es rol de sistema (ADMIN, STAFF, MEMBER)
  const isSystemRole = ["ADMIN", "STAFF", "MEMBER"].includes(
    role.name.toUpperCase(),
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return "---";
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Formato inválido";
    }
  };

  return (
    <div className="space-y-6">
      {/* CABECERA Y ESTADO (Estilo MemberDetails) */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-4">
          <div
            className={`h-14 w-14 rounded-xl flex items-center justify-center text-white shadow-lg ${isSystemRole ? "bg-indigo-600 shadow-indigo-100" : "bg-slate-500 shadow-slate-100"}`}
          >
            <Shield size={28} />
          </div>
          <div>
            <h4 className="text-xl font-black text-gray-900 leading-tight">
              {role.name}
            </h4>
            <div className="flex items-center gap-2 text-gray-500 mt-1">
              <span className="text-xs font-bold uppercase tracking-tight">
                ID del Rol: #{role.id}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={role.active ? "green" : "red"}>
            {role.active ? "ACTIVO" : "INACTIVO"}
          </Badge>
          <Badge
            variant={isSystemRole ? "indigo" : "gray"}
            icon={isSystemRole ? <Lock size={10} /> : <LockOpen size={10} />}
          >
            {isSystemRole ? "SISTEMA" : "INFORMATIVO"}
          </Badge>
        </div>
      </div>

      {/* BLOQUE DE DESCRIPCIÓN */}
      <div className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
          <Info size={12} /> Descripción
        </label>
        <p className="text-sm font-medium text-gray-600 leading-relaxed italic bg-slate-50 p-4 rounded-lg border border-slate-100">
          "
          {role.description ||
            "No se ha proporcionado una descripción detallada para este rol."}
          "
        </p>
      </div>

      {/* CAMPOS AUDITORÍA */}
      <div
        className={`p-4 bg-slate-900 rounded-2xl grid gap-4 ${
          role.deletedAt ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"
        }`}
      >
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Calendar size={10} /> Configurado el
          </span>
          <span className="text-[11px] font-medium text-white mt-1">
            {formatDate(role.createdAt)}
          </span>
        </div>

        <div className="flex flex-col border-t border-slate-800 sm:border-t-0 sm:border-l sm:pl-4 pt-3 sm:pt-0">
          <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Clock size={10} /> Último cambio
          </span>
          <span className="text-[11px] font-medium text-white mt-1">
            {formatDate(role.updatedAt)}
          </span>
        </div>

        {role.deletedAt && (
          <div className="flex flex-col border-t border-slate-800 sm:border-t-0 sm:border-l sm:pl-4 pt-3 sm:pt-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Trash2 size={10} /> Eliminado el
            </span>
            <span
              className={`text-[11px] font-medium mt-1 ${
                role.deletedAt ? "text-red-400" : "text-slate-500 italic"
              }`}
            >
              {role.deletedAt
                ? formatDate(role.deletedAt)
                : "Este rol no ha sido eliminado"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleDetails;
