import React, { useState, useEffect } from "react";
import { Save, X, Loader2, XCircle } from "lucide-react";
import Button from "../../../components/shared/Button";
import { registrationService } from "../services/registration.service";
import { teamService, type Team } from "../../identity/services/team.service";
import { userService, type User } from "../../identity/services/user.service";
import { authService } from "../../auth/services/auth.service";
import { type Activity } from "../services/activity.service"; // Importamos el tipo Activity

interface AddRegistrationFormProps {
  activity: Activity; // Recibimos la actividad completa para conocer sus teamIds
  onSuccess: () => void;
  onCancel: () => void;
}

const AddRegistrationForm: React.FC<AddRegistrationFormProps> = ({
  activity,
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
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (selectedTeam) {
        setUsers([]);
        setSelectedUser("");
        setLoadingUsers(true);
        try {
          const resp = await userService.getByTeam(
            Number.parseInt(selectedTeam),
          );
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
      let allTeams: Team[] = resp.data || [];

      const userManagedTeamIds = currentUser?.teamIds || [];
      const activityTeamIds = activity.teamIds || [];
      const isGlobalActivity = activityTeamIds.length === 0;

      let filteredTeams: Team[] = [];

      if (isAdmin) {
        // El ADMIN puede elegir cualquier equipo de la actividad (o todos si es global)
        filteredTeams = isGlobalActivity
          ? allTeams
          : allTeams.filter((t) => activityTeamIds.includes(t.id));
      } else if (isGlobalActivity) {
        // Si es Global: Puede elegir cualquiera de SUS equipos
        filteredTeams = allTeams.filter((t) =>
          userManagedTeamIds.includes(t.id),
        );
      } else {
        // Si es de equipo: Solo puede elegir equipos que estén en la actividad Y que él gestione
        filteredTeams = allTeams.filter(
          (t) =>
            activityTeamIds.includes(t.id) && userManagedTeamIds.includes(t.id),
        );
      }

      setTeams(filteredTeams);
    } catch (error) {
      console.error("Error cargando equipos", error);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setLoading(true);
      setError("");
      await registrationService.addManual(
        activity.id,
        Number.parseInt(selectedUser),
      );
      onSuccess();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Error al inscribir al usuario.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const selectStyles = (isDisabled: boolean) => `
    w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all text-sm
    ${isDisabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500"}
  `;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex flex-col gap-1.5 w-full">
        <span className="text-sm font-bold text-gray-700 ml-1">
          Equipo de procedencia <span className="text-red-500">*</span>
        </span>
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className={selectStyles(false)}
          required
        >
          <option value="">-- Seleccionar origen --</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id.toString()}>
              {t.name}
            </option>
          ))}
        </select>
        <p className="text-[10px] text-gray-400 ml-1 italic">
          {activity.teamIds.length > 0
            ? "Solo puedes añadir miembros de los equipos vinculados a esta actividad."
            : "Actividad global: puedes añadir miembros de tus equipos gestionados."}
        </p>
      </div>

      <div className="flex flex-col gap-1.5 w-full">
        <span className="text-sm font-bold text-gray-700 ml-1">
          Seleccionar Integrante <span className="text-red-500">*</span>
        </span>
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
      </div>

      {/* Contenedor de Error integrado en el modal */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold animate-in fade-in duration-200">
          <XCircle size={14} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

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
          icon={<Save size={18} />}
        >
          Confirmar Inscripción
        </Button>
      </div>
    </form>
  );
};

export default AddRegistrationForm;
