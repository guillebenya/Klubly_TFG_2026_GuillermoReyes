import React, { useState, useEffect } from "react";
import { Save, X, Loader2 } from "lucide-react"; // Añadimos Loader2 para feedback
import Button from "../../../components/shared/Button";
import { registrationService } from "../services/registration.service";
import { teamService, type Team } from "../../identity/services/team.service";
import { userService, type User } from "../../identity/services/user.service";
import { authService } from "../../auth/services/auth.service";

interface AddRegistrationFormProps {
  activityId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const AddRegistrationForm: React.FC<AddRegistrationFormProps> = ({
  activityId,
  onSuccess,
  onCancel,
}) => {
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.roleName === "ADMIN";

  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false); // Estado para el segundo select

  useEffect(() => {
    loadTeams();
  }, []);

  // REVISIÓN: Limpieza y carga de usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      if (selectedTeam) {
        setUsers([]); 
        setSelectedUser(""); //
        setLoadingUsers(true);
        try {
          const resp = await userService.getByTeam(parseInt(selectedTeam));
          const data = resp.data || [];
          setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Error cargando usuarios del equipo", error);
          setUsers([]);
        } finally {
          setLoadingUsers(false);
        }
      } else {
        setUsers([]);
        setSelectedUser("");
      }
    };

    fetchUsers();
  }, [selectedTeam]);

  const loadTeams = async () => {
    try {
      const resp = await teamService.getAll();
      let filteredTeams: Team[] = resp.data || [];

      if (!isAdmin && currentUser?.affiliations) {
        const userTeamIds = currentUser.affiliations.map(
          (aff: any) => aff.teamId,
        );
        filteredTeams = filteredTeams.filter((t) => userTeamIds.includes(t.id));
      }
      setTeams(filteredTeams);
    } catch (error) {
      console.error("Error cargando equipos", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setLoading(true);
      await registrationService.addManual(activityId, parseInt(selectedUser));
      onSuccess();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Error al inscribir al usuario.");
    } finally {
      setLoading(false);
    }
  };

  const selectStyles = (isDisabled: boolean) => `
    w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all text-sm
    ${
      isDisabled
        ? "bg-gray-100 cursor-not-allowed opacity-60"
        : "focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500"
    }
  `;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Selector de Equipo */}
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-sm font-bold text-gray-700 ml-1">
          Seleccionar Equipo <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className={selectStyles(false)}
          required
        >
          <option value="">-- Elige un equipo --</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id.toString()}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Selector de Usuario */}
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-sm font-bold text-gray-700 ml-1">
          Seleccionar Integrante <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            disabled={!selectedTeam || loadingUsers}
            className={selectStyles(!selectedTeam || loadingUsers)}
            required
          >
            <option value="">
              {loadingUsers ? "Cargando miembros..." : "-- Elige un miembro --"}
            </option>
            {users.map((u) => (
              <option key={u.id} value={u.id.toString()}>
                {u.firstName} {u.lastName}
              </option>
            ))}
          </select>
          {loadingUsers && (
            <div className="absolute right-10 top-3">
              <Loader2 className="animate-spin text-indigo-500" size={16} />
            </div>
          )}
        </div>
        {selectedTeam && !loadingUsers && users.length === 0 && (
          <p className="text-[10px] text-amber-600 ml-1">
            Este equipo no tiene integrantes registrados.
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button
          variant="secondary"
          onClick={onCancel}
          type="button"
          icon={<X size={18} />}
        >
          Cancelar
        </Button>
        <Button
          variant="add"
          type="submit"
          isLoading={loading}
          disabled={!selectedUser || loading}
        >
          Confirmar
        </Button>
      </div>
    </form>
  );
};

export default AddRegistrationForm;
