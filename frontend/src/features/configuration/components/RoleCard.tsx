import React from "react";
import {
  Shield,
  Edit2,
  Trash2,
  Lock,
  LockOpen,
  Eye,
  Users,
  Users2,
} from "lucide-react";
import Button from "../../../components/shared/Button";
import { type Role } from "../services/role.service";
import Badge from "../../../components/shared/Badge";

interface RoleCardProps {
  role: Role;
  onView: (role: Role) => void;
  onEdit?: (role: Role) => void;
  onDelete?: (id: number) => void;
}

const RoleCard = ({ role, onView, onEdit, onDelete }: RoleCardProps) => {
  const isSystemRole = ["ADMIN", "STAFF", "MEMBER"].includes(
    role.name.toUpperCase(),
  );
  const hasUsers = (role.userCount || 0) > 0;

  // Función para determinar el mensaje del tooltip de borrado
  const getDeleteTooltip = () => {
    if (isSystemRole) return "Los roles de sistema no se pueden eliminar";
    if (hasUsers) return "No puedes eliminar un rol con usuarios asociados";
    return "Eliminar rol";
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${isSystemRole ? "bg-indigo-500" : "bg-gray-200"}`}
      />

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${isSystemRole ? "bg-indigo-50 text-indigo-600" : "bg-gray-50 text-gray-400"}`}
          >
            <Shield size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight line-clamp-1">
                {role.name}
              </h3>

            </div>

            {isSystemRole ? (
              <span className="flex items-center gap-0.5 mt-1 text-indigo-600 text-[8px] font-black uppercase tracking-tighter">
                <Lock size={8} /> Rol de Sistema
              </span>
            ) : (
              <span className="flex items-center gap-0.5 mt-1 text-gray-400 text-[8px] font-black uppercase tracking-tighter">
                <LockOpen size={8} /> Personalizado
              </span>
            )}

            <p className="text-[10px] text-gray-400 font-medium">
              ID Rol: #{role.id}
            </p>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(role)}
            className="!text-blue-500 hover:!bg-blue-50"
            title="Ver detalles"
          >
            <Eye size={16} />
          </Button>

          {/* 2. RENDERIZADO CONDICIONAL: Solo si onEdit existe */}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(role)}
              className="!text-amber-500 hover:!bg-amber-50"
              disabled={isSystemRole}
              title={
                isSystemRole
                  ? "Los roles de sistema no se pueden editar"
                  : "Editar rol"
              }
            >
              <Edit2 size={16} />
            </Button>
          )}

          {/* 3. RENDERIZADO CONDICIONAL: Solo si onDelete existe */}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(role.id)}
              className="!text-red-500 hover:!bg-red-50"
              disabled={isSystemRole || hasUsers}
              title={getDeleteTooltip()}
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </div>

      <div className="min-h-[40px]">
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 italic">
          {role.description || "Sin descripción definida."}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Número de usuarios con este rol:
        </span>
        <div className="flex items-center gap-1.5">
            {hasUsers ? (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full">
                <Users2 size={10} className="text-indigo-500" />
                <span className="text-[10px] font-black uppercase">
                  {role.userCount} {role.userCount === 1 ? 'Usuario' : 'Usuarios'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-400 border border-gray-100 rounded-full">
                <Users2 size={10} />
                <span className="text-[10px] font-bold uppercase tracking-tight">Vacío</span>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default RoleCard;
