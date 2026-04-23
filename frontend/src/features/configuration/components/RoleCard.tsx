import React from "react";
import {
  Shield,
  Edit2,
  Trash2,
  Lock,
  LockOpen,
  Eye,
  Users,
} from "lucide-react";
import Button from "../../../components/shared/Button";
import { type Role } from "../services/role.service";
import Badge from "../../../components/shared/Badge";

interface RoleCardProps {
  role: Role;
  onView: (role: Role) => void;
  onEdit: (role: Role) => void;
  onDelete: (id: number) => void;
}

const RoleCard = ({ role, onView, onEdit, onDelete }: RoleCardProps) => {
  const isSystemRole = ["ADMIN", "STAFF", "MEMBER"].includes(
    role.name.toUpperCase(),
  );
  const hasUsers = (role.userCount || 0) > 0;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${isSystemRole ? "bg-indigo-500" : "bg-gray-200"}`}
      />

      {/* CABECERA: Título a la izquierda, Botones a la derecha */}
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

              {/* BADGE DE USUARIOS: Visual y funcional */}
              <Badge
                variant={hasUsers ? "indigo" : "gray"}
                icon={<Users size={10} />}
                className="rounded-full" // Para mantener el estilo circular que tenías
              >
                {role.userCount || 0}
              </Badge>
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
          </div>
        </div>

        {/* BOTONES DE ACCIÓN (A la derecha) */}
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

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(role.id)}
            className="!text-red-500 hover:!bg-red-50"
            disabled={isSystemRole || hasUsers}
            title={
              isSystemRole
                ? "Los roles de sistema no se pueden eliminar"
                : "No se puede eliminar un rol que aún tiene usuarios asociados"
            }
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {/* Descripción del Rol */}
      <div className="min-h-[40px]">
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 italic">
          {role.description || "Sin descripción definida."}
        </p>
      </div>
    </div>
  );
};

export default RoleCard;
