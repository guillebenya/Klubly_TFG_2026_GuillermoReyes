import {
  Shield,
  Edit2,
  Trash2,
  Lock,
  LockOpen,
  Eye,
  Users2,
} from "lucide-react";
import Button from "../../../components/shared/Button";
import Badge from "../../../components/shared/Badge";
import Card from "../../../components/shared/Card"; // 1. Adaptado uso de Card
import { type Role } from "../services/role.service";

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

  const getDeleteTooltip = () => {
    if (isSystemRole) return "Los roles de sistema no se pueden eliminar";
    if (hasUsers) return "No puedes eliminar un rol con usuarios asociados";
    return "Eliminar rol";
  };

  return (
    <Card
      className={`!p-5 shadow-sm hover:shadow-md group relative overflow-hidden transition-all border-l-4 ${
        !role.active
          ? "border-l-gray-300 hover:border-l-gray-400 bg-gray-50/40"
          : isSystemRole
            ? "border-l-indigo-300 hover:border-l-indigo-600"
            : "border-l-sky-300 hover:border-l-sky-500"
      } ${role.active ? "" : "opacity-65"}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 `} />

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              !role.active
                ? "bg-gray-50 text-gray-400"
                : isSystemRole
                  ? "bg-indigo-50 text-indigo-600"
                  : "bg-sky-50 text-sky-600"
            }`}
          >
            <Shield size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight line-clamp-1">
                {role.name}{" "}
                {!role.active && <Badge variant="red">INACTIVO</Badge>}
              </h3>
            </div>

            {isSystemRole ? (
              <span
                className={`flex items-center gap-0.5 mt-1 text-[8px] font-black uppercase tracking-tighter ${
                  !role.active ? "text-gray-400" : "text-indigo-600"
                }`}
              >
                <Lock size={8} /> Rol de Sistema
              </span>
            ) : (
              <span
                className={`flex items-center gap-0.5 mt-1 text-[8px] font-black uppercase tracking-tighter ${
                  !role.active ? "text-gray-400" : "text-sky-600"
                }`}
              >
                <LockOpen size={8} /> Rol Informativo
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
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onView(role)}
            className="!text-blue-500 hover:!bg-blue-50"
            title="Ver detalles"
          >
            <Eye size={16} />
          </Button>

          {onEdit && (
            <Button
              type="button"
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

          {onDelete && (
            <Button
              type="button"
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
            <Badge
              variant={!role.active ? "gray" : isSystemRole ? "indigo" : "sky"}
              icon={<Users2 size={10} />}
              className="rounded-full px-2.5 py-1 !font-black !uppercase"
            >
              {role.userCount} {role.userCount === 1 ? "Usuario" : "Usuarios"}
            </Badge>
          ) : (
            <Badge
              variant="gray"
              icon={<Users2 size={10} />}
              className="rounded-full px-2.5 py-1 !font-bold !uppercase !tracking-tight !text-gray-400"
            >
              Vacío
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};

export default RoleCard;