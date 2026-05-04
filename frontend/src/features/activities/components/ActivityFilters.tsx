import React, { useEffect, useState } from "react";
import { FilterX, Check } from "lucide-react";
import Button from "../../../components/shared/Button";
import { teamService, type Team } from "../../identity/services/team.service";
import { authService } from "../../auth/services/auth.service";

interface ActivityFiltersProps {
  filters: {
    teams: number[];
    status: boolean[];
    dateRange: { start: string; end: string };
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  onApply: () => void;
}

const ActivityFilters: React.FC<ActivityFiltersProps> = ({
  filters,
  setFilters,
  onApply,
}) => {
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.roleName === "ADMIN";
  const isMember = currentUser?.roleName === "MEMBER";

  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const resp = await teamService.getAll();
        let teams: Team[] = resp.data;

        if (!isAdmin) {
          const userTeamIds = currentUser?.teamIds || [];
          
          // Filtramos: Solo equipos cuyo ID esté incluido en el array teamIds del usuario
          // Usamos Number() por seguridad para asegurar que comparamos números
          teams = teams.filter((t) => userTeamIds.includes(Number(t.id)));
        }
        
        setAvailableTeams(teams);
      } catch (error) {
        console.error("Error cargando equipos para filtros", error);
      }
    };
    loadTeams();
  }, [currentUser?.id, isAdmin]);

  const handleReset = () => {
    setFilters({
      teams: [],
      status: [],
      dateRange: { start: "", end: "" },
    });
  };

  const toggleStatus = (val: boolean) => {
    const newStatus = filters.status.includes(val)
      ? filters.status.filter((s) => s !== val)
      : [...filters.status, val];
    setFilters({ ...filters, status: newStatus });
  };

  // Función para manejar la selección de equipos (incluyendo el Global ID: 0)
  const toggleTeam = (teamId: number) => {
    const isSelected = filters.teams.includes(teamId);
    const newTeams = isSelected
      ? filters.teams.filter((id) => id !== teamId)
      : [...filters.teams, teamId];
    setFilters({ ...filters, teams: newTeams });
  };

  const inputStyles = `
    w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none 
    focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all text-sm
  `;

  const labelStyles = "text-sm font-bold text-gray-700 ml-1";

  return (
    <div className="space-y-6">
      {/* Rango de Fechas */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-900 border-l-4 border-indigo-500 pl-2">
          Rango de Fechas
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="filter-start" className={labelStyles}>
              Desde
            </label>
            <input
              id="filter-start"
              type="date"
              className={inputStyles}
              value={filters.dateRange.start}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  dateRange: { ...filters.dateRange, start: e.target.value },
                })
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="filter-end" className={labelStyles}>
              Hasta
            </label>
            <input
              id="filter-end"
              type="date"
              className={inputStyles}
              value={filters.dateRange.end}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  dateRange: { ...filters.dateRange, end: e.target.value },
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Equipos */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-900 border-l-4 border-indigo-500 pl-2">
          Filtrar por Equipo
        </h4>
        <div className="flex flex-wrap gap-2">
          {/* BOTÓN GLOBAL */}
          <button
            type="button"
            onClick={() => toggleTeam(0)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              filters.teams.includes(0)
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
            }`}
          >
            Global / Club
          </button>

          {/* LISTA DE EQUIPOS DISPONIBLES */}
          {availableTeams.map((team) => {
            const isSelected = filters.teams.includes(team.id);
            return (
              <button
                key={team.id}
                type="button"
                onClick={() => toggleTeam(team.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                }`}
              >
                {team.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Estado (Solo Admin/Staff) */}
      {!isMember && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-gray-900 border-l-4 border-indigo-500 pl-2">
            Estado de Actividad
          </h4>
          <div className="flex gap-3">
            {[
              { label: "Activas", value: true },
              { label: "Inactivas", value: false },
            ].map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => toggleStatus(opt.value)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                  filters.status.includes(opt.value)
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-gray-50 text-gray-400 border-transparent opacity-60 shadow-inner"
                }`}
              >
                {filters.status.includes(opt.value) && <Check size={16} />}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <Button
          variant="secondary"
          className="flex-1"
          icon={<FilterX size={18} />}
          onClick={handleReset}
        >
          Limpiar
        </Button>
        <Button variant="primary" className="flex-1" onClick={onApply}>
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
};

export default ActivityFilters;
