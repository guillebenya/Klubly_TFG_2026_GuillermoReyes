import React, { useState, useEffect } from "react";
import { Check, Save, X } from "lucide-react";
import Button from "../../../components/shared/Button";
import { type Activity } from "../services/activity.service";
import { teamService, type Team } from "../../identity/services/team.service";
import { authService } from "../../auth/services/auth.service";

interface ActivityFormProps {
  initialData: Activity | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

const ActivityForm: React.FC<ActivityFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading,
}) => {
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.roleName === "ADMIN";

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    capacity: initialData?.capacity || 10,
    location: initialData?.location || "",
    active: initialData?.active ?? true,
    teamIds: initialData?.teamIds || ([] as number[]),
  });

  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const resp = await teamService.getAll();
        let teams: Team[] = resp.data;

        // FILTRADO DE SEGURIDAD PARA EL SELECTOR DE EQUIPOS
        if (!isAdmin) {
          // Extraemos directamente el array teamIds del usuario (asegurando un array vacío por defecto)
          const userTeamIds = currentUser?.teamIds || [];

          // Filtramos la lista de equipos para dejar solo aquellos cuyo ID esté en la lista del usuario
          teams = teams.filter((t) => userTeamIds.includes(Number(t.id)));
        }
        setAvailableTeams(teams);
      } catch (error) {
        console.error("Error cargando equipos:", error);
      }
    };
    loadTeams();
  }, [currentUser?.id, isAdmin]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "capacity" ? Number.parseInt(value) || 0 : value,
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "El nombre es obligatorio";
    if (!formData.startDate)
      newErrors.startDate = "La fecha de inicio es obligatoria";
    if (!formData.endDate) newErrors.endDate = "La fecha de fin es obligatoria";
    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) >= new Date(formData.endDate)
    ) {
      newErrors.endDate = "La fecha de fin debe ser posterior a la de inicio";
    }
    if (formData.capacity <= 0)
      newErrors.capacity = "La capacidad debe ser mayor a 0";

    if (initialData && formData.capacity < initialData.registeredCount) {
      newErrors.capacity = `La capacidad no puede ser inferior a los inscritos actuales (${initialData.registeredCount})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };

  const getInputStyles = (errorKey: string) => `
    w-full px-4 py-2.5 bg-gray-50 border rounded-xl outline-none transition-all text-sm
    ${
      errors[errorKey]
        ? "border-red-500 focus:ring-4 focus:ring-red-100"
        : "border-gray-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500"
    }
  `;

  const toggleTeam = (teamId: number) => {
    setFormData((prev) => {
      const isSelected = prev.teamIds.includes(teamId);
      const newTeamIds = isSelected
        ? prev.teamIds.filter((id) => id !== teamId) // Si ya está, lo quito
        : [...prev.teamIds, teamId]; // Si no está, lo añado
      return { ...prev, teamIds: newTeamIds };
    });
  };

  const labelStyles = "text-sm font-bold text-gray-700 ml-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nombre */}
      <div className="flex flex-col gap-1.5 w-full">
        <label htmlFor="name" className={labelStyles}>
          Nombre de la Actividad <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Ej: Entrenamiento Senior"
          value={formData.name}
          onChange={handleChange}
          className={getInputStyles("name")}
        />
        {errors.name && (
          <span className="text-xs text-red-500 font-medium ml-1">
            {errors.name}
          </span>
        )}
      </div>

      {/* Descripción */}
      <div className="flex flex-col gap-1.5 w-full">
        <label htmlFor="description" className={labelStyles}>
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className={getInputStyles("description")}
        />
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 w-full">
          <label htmlFor="startDate" className={labelStyles}>
            Fecha de Inicio <span className="text-red-500">*</span>
          </label>
          <input
            id="startDate"
            name="startDate"
            type="datetime-local"
            value={formData.startDate}
            onChange={handleChange}
            className={getInputStyles("startDate")}
          />
          {errors.startDate && (
            <span className="text-xs text-red-500 font-medium ml-1">
              {errors.startDate}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label htmlFor="endDate" className={labelStyles}>
            Fecha de Fin <span className="text-red-500">*</span>
          </label>
          <input
            id="endDate"
            name="endDate"
            type="datetime-local"
            value={formData.endDate}
            onChange={handleChange}
            className={getInputStyles("endDate")}
          />
          {errors.endDate && (
            <span className="text-xs text-red-500 font-medium ml-1">
              {errors.endDate}
            </span>
          )}
        </div>
      </div>

      {/* Ubicación y Capacidad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 w-full">
          <label htmlFor="location" className={labelStyles}>
            Ubicación
          </label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="Ej: Pabellón Central"
            value={formData.location}
            onChange={handleChange}
            className={getInputStyles("location")}
          />
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label htmlFor="capacity" className={labelStyles}>
            Capacidad Máxima <span className="text-red-500">*</span>
          </label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            value={formData.capacity}
            onChange={handleChange}
            className={getInputStyles("capacity")}
          />
          {errors.capacity && (
            <span className="text-xs text-red-500 font-medium ml-1">
              {errors.capacity}
            </span>
          )}
        </div>
      </div>

      {/* Equipos Vinculados (Chip Selector) */}
      <div className="flex flex-col gap-2 w-full">
        <span className="text-sm font-bold text-gray-700 ml-1">
          Equipos Vinculados
        </span>

        <div className="min-h-[60px] p-3 bg-gray-50 border border-gray-200 rounded-xl flex flex-wrap gap-2 transition-all focus-within:ring-4 focus-within:ring-indigo-50 focus-within:border-indigo-500">
          {availableTeams.length > 0 ? (
            availableTeams.map((t) => {
              const isSelected = formData.teamIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTeam(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-2 ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                  }`}
                >
                  {isSelected && <Check size={14} />}
                  {t.name}
                </button>
              );
            })
          ) : (
            <p className="text-xs text-gray-400 italic m-auto">
              No hay equipos disponibles para vincular
            </p>
          )}
        </div>

        <p className="text-[10px] text-gray-400 ml-1 italic">
          {formData.teamIds.length === 0
            ? "Selecciona los equipos que participarán en esta actividad (Si no seleccionas ninguno, será Global)"
            : `Has seleccionado ${formData.teamIds.length} equipo(s)`}
        </p>
      </div>

      {/* Toggle Activo */}
      <div className="md:col-span-2 pt-2">
        <button
          type="button"
          role="switch"
          aria-checked={formData.active}
          onClick={() => setFormData({ ...formData, active: !formData.active })}
          className="flex items-center gap-3 cursor-pointer select-none w-fit border-none bg-transparent p-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-lg"
        >
          {/* Visual del Toggle */}
          <div
            className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${
              formData.active ? "bg-indigo-600" : "bg-gray-300"
            }`}
          >
            <div
              className={`bg-white w-3 h-3 rounded-full transform transition-transform duration-300 ${
                formData.active ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>

          {/* Etiqueta de texto */}
          <span
            className={`text-sm font-bold uppercase tracking-tight transition-colors ${
              formData.active ? "text-gray-700" : "text-gray-500"
            }`}
          >
            {formData.active ? "Actividad Activa" : "Actividad Inactiva"}
          </span>
        </button>
      </div>

      {/* Botones */}
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
          variant={initialData ? "primary" : "add"}
          type="submit"
          isLoading={loading}
          icon={<Save size={18} />}
        >
          {initialData ? "Guardar Cambios" : "Crear Actividad"}
        </Button>
      </div>
    </form>
  );
};

export default ActivityForm;
