// src/features/identity/components/MemberFilters.tsx
import React from "react";
import { Shield, Activity, Users, RotateCcw } from "lucide-react";
import Button from "../../../components/shared/Button";
import { authService } from "../../auth/services/auth.service";

interface MemberFiltersProps {
  filters: {
    roles: string[];
    status: boolean[];
    teams: number[];
  };
  setFilters: (filters: any) => void;
  availableTeams: any[];
  onApply: () => void;
}

const MemberFilters = ({
  filters,
  setFilters,
  availableTeams,
  onApply,
}: MemberFiltersProps) => {
  const toggleFilter = (category: "roles" | "status" | "teams", value: any) => {
    const current = [...filters[category]];
    const index = current.indexOf(value);

    if (index > -1) {
      current.splice(index, 1); // Quitar si ya está
    } else {
      current.push(value); // Añadir si no está
    }

    setFilters({ ...filters, [category]: current });
  };

  const clearFilters = () => {
    setFilters({ roles: [], status: [], teams: [] });
  };

  //Para comprobar si el usuario actual es Admin y mostrar los estados y el rol admin solo a ellos
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.roleName === "Admin";

  return (
    <div className="space-y-6">
      {/* SECCIÓN ROLES */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Shield size={14} /> Roles de usuario
        </label>
        <div className="flex flex-wrap gap-2">
          {["ADMIN", "STAFF", "MEMBER"].map((role) => (
            <button
              key={role}
              onClick={() => toggleFilter("roles", role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filters.roles.includes(role)
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* SECCIÓN ESTADO */}
      {isAdmin && (
      <div className="space-y-3">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Activity size={14} /> Estado de cuenta
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => toggleFilter("status", true)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
              filters.status.includes(true)
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-gray-100 bg-gray-50 text-gray-400"
            }`}
          >
            ACTIVOS
          </button>
          <button
            onClick={() => toggleFilter("status", false)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
              filters.status.includes(false)
                ? "border-red-500 bg-red-50 text-red-700"
                : "border-gray-100 bg-gray-50 text-gray-400"
            }`}
          >
            INACTIVOS
          </button>
        </div>
      </div>
      )}

      {/* SECCIÓN EQUIPOS (Si hay equipos disponibles) */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Users size={14} /> Filtrar por Equipo
        </label>
        <div className="max-h-40 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
          {availableTeams.map((team) => (
            <div
              key={team.id}
              onClick={() => toggleFilter("teams", team.id)}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
            >
              <span
                className={`text-xs font-bold ${filters.teams.includes(team.id) ? "text-indigo-600" : "text-gray-600"}`}
              >
                {team.name}
              </span>
              <div
                className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                  filters.teams.includes(team.id)
                    ? "bg-indigo-600 border-indigo-600"
                    : "border-gray-300"
                }`}
              >
                {filters.teams.includes(team.id) && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <Button
          variant="secondary"
          className="flex-1"
          icon={<RotateCcw size={16} />}
          onClick={clearFilters}
        >
          Limpiar
        </Button>
        <Button variant="primary" className="flex-2" onClick={onApply}>
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
};

export default MemberFilters;
