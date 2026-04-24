import React, { useEffect, useState } from "react";
import { Tag, Plus, Loader2, History, ArrowLeft } from "lucide-react";
import Button from "../../../components/shared/Button";
import Modal from "../../../components/shared/Modal";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import SuccessDialog from "../../../components/shared/SuccessDialog";
import CategoryCard from "./CategoryCard";
import CategoryDetails from "./CategoryDetails";
import { categoryService, type Category } from "../services/category.service";

const CategoriesSection = () => {
  // --- ESTADOS DE DATOS ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [isHistoryMode, setIsHistoryMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  // --- ESTADOS DE MODALES ---
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    type: "save" | "delete";
    data?: any;
  }>({ isOpen: false, type: "save" });

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

  // Cargar categorías al montar o cambiar de modo
  useEffect(() => {
    fetchCategories();
  }, [isHistoryMode]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const resp = isHistoryMode
        ? await categoryService.getDeletedHistory()
        : await categoryService.getAll();
      setCategories(resp.data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---

  const handleView = (cat: Category) => {
    setSelectedCategory(cat);
    setIsViewOpen(true);
  };

  const handleAddNew = () => {
    setSelectedCategory(null);
    setFormData({ name: "", description: "", active: true });
    setIsFormOpen(true);
  };

  const handleEdit = (cat: Category) => {
    setSelectedCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description,
      active: cat.active,
    });
    setIsFormOpen(true);
  };

  const handleDeleteTrigger = (id: number) => {
    setConfirmConfig({ isOpen: true, type: "delete", data: id });
  };

  const handleSaveTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmConfig({ isOpen: true, type: "save", data: formData });
  };

  const executeAction = async () => {
    try {
      setFormLoading(true);
      if (confirmConfig.type === "delete") {
        await categoryService.delete(confirmConfig.data);
        setSuccessConfig({
          isOpen: true,
          title: "Categoría eliminada",
          desc: "La categoría ha sido enviada al historial de bajas correctamente.",
        });
      } else {
        if (selectedCategory) {
          await categoryService.update(selectedCategory.id, confirmConfig.data);
        } else {
          await categoryService.create(confirmConfig.data);
        }
        setSuccessConfig({
          isOpen: true,
          title: "¡Configuración guardada!",
          desc: "Los datos de la categoría se han actualizado en el sistema.",
        });
      }
      setConfirmConfig({ ...confirmConfig, isOpen: false });
    } catch (error) {
      console.error("Error en la operación:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessConfig({ ...successConfig, isOpen: false });
    setIsFormOpen(false);
    fetchCategories();
  };

  const hasItems = selectedCategory && (selectedCategory as any).itemCount > 0;

  return (
    <div className="space-y-6">
      {/* CABECERA DE SECCIÓN */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${isHistoryMode ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600"}`}
          >
            {isHistoryMode ? <History size={20} /> : <Tag size={20} />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tight">
              {isHistoryMode
                ? "Historial de Categorías"
                : "Categorías de Inventario"}
            </h3>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
              {isHistoryMode
                ? "Registros de categorías eliminadas"
                : "Gestiona las categorías de los productos"}
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
              Volver a Activas
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
                Añadir Categoría
              </Button>
            </>
          )}
        </div>
      </div>

      {/* LISTADO DE CARDS */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                onView={handleView}
                // Pasamos undefined si es historial para capar los botones
                onEdit={isHistoryMode ? undefined : handleEdit}
                onDelete={isHistoryMode ? undefined : handleDeleteTrigger}
              />
            ))
          ) : (
            <div className="col-span-full bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-100">
              <p className="text-gray-500 italic text-sm">
                {isHistoryMode
                  ? "No se han encontrado categorías eliminadas."
                  : "No hay categorías registradas en el inventario."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODAL: VER DETALLES */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Detalles de la Categoría"
        size="sm"
      >
        {selectedCategory && <CategoryDetails category={selectedCategory} />}
      </Modal>

      {/* MODAL: FORMULARIO ALTA/EDICIÓN */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedCategory ? "Editar Categoría" : "Nueva Categoría"}
      >
        <form onSubmit={handleSaveTrigger} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
              Nombre
            </label>
            <input
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ej: Ropa de Entrenamiento"
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
              placeholder="Describe qué tipos de artículos pertenecen aquí..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-[100px] transition-all"
            />
          </div>

          {/* Toggle de Estado Activo */}
          <div className="flex flex-col gap-1 py-2 ml-1">
            <div className="flex items-center gap-3">
              <div
                onClick={() => {
                  // REGLA: Si tiene ítems y está activa, bloqueamos el cambio a inactiva
                  if (hasItems && formData.active) {
                    alert(
                      `No puedes desactivar esta categoría porque todavía tiene ${
                        (selectedCategory as any).itemCount
                      } productos vinculados. Primero debes mover esos productos a otra categoría o eliminarlos.`,
                    );
                    return;
                  }
                  setFormData({ ...formData, active: !formData.active });
                }}
                className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${
                  formData.active ? "bg-indigo-600" : "bg-gray-300"
                } ${
                  hasItems && formData.active
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <div
                  className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 ${
                    formData.active ? "left-6" : "left-1"
                  }`}
                />
              </div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">
                {formData.active ? "Categoría Activa" : "Categoría Inactiva"}
              </span>
            </div>

            {/* Mensaje de aviso visual si hay ítems vinculados */}
            {hasItems && formData.active && (
              <p className="text-[10px] text-amber-600 font-medium ml-1">
                * No se puede desactivar: hay productos vinculados a esta
                categoría.
              </p>
            )}
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

      {/* DIÁLOGOS DE CONFIRMACIÓN Y ÉXITO */}
      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={executeAction}
        title="¿Confirmar acción?"
        description={
          confirmConfig.type === "delete"
            ? "Esta acción dará de baja la categoría. No podrá eliminarse si tiene productos vinculados."
            : "¿Deseas aplicar estos cambios en la categoría?"
        }
        confirmLabel={confirmConfig.type === "delete" ? "Eliminar" : "Guardar"}
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

export default CategoriesSection;
