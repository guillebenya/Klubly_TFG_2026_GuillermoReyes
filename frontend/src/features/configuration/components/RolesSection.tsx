import React, { useEffect, useState } from "react";
import { Shield, Plus, Loader2, History, ArrowLeft } from "lucide-react";
import Button from "../../../components/shared/Button";
import Modal from "../../../components/shared/Modal";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import SuccessDialog from "../../../components/shared/SuccessDialog";
import RoleCard from "./RoleCard";
import RoleDetails from "./RoleDetails"; // Asegúrate de tener este archivo creado
import { roleService, type Role } from "../services/role.service";

const RolesSection = () => {
  // --- ESTADOS DE DATOS ---
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isHistoryMode, setIsHistoryMode] = useState(false);

  // --- ESTADOS DE MODALES ---
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    type: "save" | "delete";
    data?: any;
  }>({
    isOpen: false,
    type: "save",
  });
  const [successConfig, setSuccessConfig] = useState({
    isOpen: false,
    title: "",
    desc: "",
  });

  // --- ESTADO DEL FORMULARIO ---
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    active: true,
  });

  useEffect(() => {
    fetchRoles();
  }, [isHistoryMode]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      // <--- LÓGICA DE CARGA SEGÚN EL MODO
      const resp = isHistoryMode
        ? await roleService.getDeletedHistory()
        : await roleService.getAll();

      setRoles(resp.data);
    } catch (error) {
      console.error("ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS DE ACCIÓN ---

  const handleView = (role: Role) => {
    setSelectedRole(role);
    setIsViewOpen(true);
  };

  const handleAddNew = () => {
    setSelectedRole(null);
    setFormData({ name: "", description: "", active: true });
    setIsFormOpen(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      active: role.active,
    });
    setIsFormOpen(true);
  };

  const handleSaveTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmConfig({ isOpen: true, type: "save", data: formData });
  };

  const handleDeleteTrigger = (id: number) => {
    setConfirmConfig({ isOpen: true, type: "delete", data: id });
  };

  // --- EJECUCIÓN REAL (API) ---

  const executeAction = async () => {
    try {
      setFormLoading(true);
      if (confirmConfig.type === "delete") {
        await roleService.delete(confirmConfig.data);
        setSuccessConfig({
          isOpen: true,
          title: "Rol eliminado",
          desc: "El rol se ha borrado correctamente del sistema.",
        });
      } else {
        if (selectedRole) {
          await roleService.update(selectedRole.id, confirmConfig.data);
        } else {
          await roleService.create(confirmConfig.data);
        }
        setSuccessConfig({
          isOpen: true,
          title: "¡Configuración guardada!",
          desc: "Los datos del rol han sido actualizados con éxito.",
        });
      }
      setConfirmConfig({ ...confirmConfig, isOpen: false });
    } catch (error) {
      console.error("Error en la operación:", error);
      alert("Hubo un error al procesar la solicitud.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessConfig({ ...successConfig, isOpen: false });
    setIsFormOpen(false);
    fetchRoles();
  };

  return (
    <div className="space-y-6">
      {/* CABECERA DINÁMICA */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${isHistoryMode ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600"}`}
          >
            {isHistoryMode ? <History size={20} /> : <Shield size={20} />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tight">
              {isHistoryMode ? "Historial de Roles" : "Listado de Roles"}
            </h3>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
              {isHistoryMode
                ? "Consulta roles eliminados del club."
                : "Administra los roles del club"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isHistoryMode ? (
            <Button
              variant="secondary"
              size="sm"
              icon={<ArrowLeft size={18} />}
              onClick={() => setIsHistoryMode(false)}
            >
              Volver a Roles
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                icon={<History size={18} />}
                className="!text-indigo-600 hover:!bg-indigo-50"
                onClick={() => setIsHistoryMode(true)}
              >
                Ver Bajas
              </Button>
              <Button
                variant="add"
                size="sm"
                icon={<Plus size={18} />}
                onClick={handleAddNew}
              >
                Añadir Rol
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Listado de Cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.length > 0 ? (
            roles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                onView={handleView}
                onEdit={isHistoryMode ? undefined : handleEdit}
                onDelete={isHistoryMode ? undefined : handleDeleteTrigger}
              />
            ))
          ) : (
            <div className="col-span-full bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-100">
              <p className="text-gray-500 italic text-sm">
                {isHistoryMode
                  ? "No hay registros de roles eliminados."
                  : "No hay roles configurados en el sistema."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODAL: VER DETALLES */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Detalles del Rol"
        size="sm"
      >
        {selectedRole && <RoleDetails role={selectedRole} />}
      </Modal>

      {/* MODAL: FORMULARIO ALTA/EDICIÓN */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedRole ? "Editar Rol" : "Nuevo Rol"}
      >
        <form onSubmit={handleSaveTrigger} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
              Nombre del Rol
            </label>
            <input
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ej: ENTRENADOR_AYUDANTE"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe las responsabilidades de este rol..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-[100px] transition-all"
            />
          </div>

          {/* Toggle de Estado Activo */}
          <div className="flex items-center gap-3 py-2 ml-1">
            <div
              onClick={() =>
                setFormData({ ...formData, active: !formData.active })
              }
              className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${formData.active ? "bg-indigo-600" : "bg-gray-300"}`}
            >
              <div
                className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 ${formData.active ? "left-6" : "left-1"}`}
              />
            </div>
            <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">
              {formData.active ? "Rol Activo" : "Rol Inactivo"}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsFormOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </Modal>

      {/* DIÁLOGOS DE SISTEMA */}
      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={executeAction}
        title="¿Confirmar acción?"
        description={
          confirmConfig.type === "delete"
            ? "Esta acción eliminará el rol permanentemente. Los usuarios con este rol podrían perder sus etiquetas informativas."
            : "¿Estás seguro de que deseas aplicar estos cambios en la configuración del rol?"
        }
        confirmLabel={
          confirmConfig.type === "delete" ? "Eliminar Rol" : "Guardar Cambios"
        }
        type={confirmConfig.type === "delete" ? "danger" : "warning"}
        isLoading={formLoading}
      />

      <SuccessDialog
        isOpen={successConfig.isOpen}
        onClose={handleSuccessClose}
        title={successConfig.title}
        description={successConfig.desc}
      />
    </div>
  );
};

export default RolesSection;
