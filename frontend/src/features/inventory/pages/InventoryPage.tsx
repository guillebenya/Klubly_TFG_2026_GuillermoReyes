import { useEffect, useState } from "react";
import {
  Plus,
  Filter,
  Loader2,
  History,
  ArrowLeft,
  Package,
  AlertTriangle, // Icono para alertas
  Layers, // Icono para total de ítems
} from "lucide-react";

// Componentes Compartidos
import PageHeader from "../../../components/shared/PageHeader";
import Button from "../../../components/shared/Button";
import Modal from "../../../components/shared/Modal";
import SummaryCard from "../../../components/shared/SummaryCard"; // Importamos el shared

// Componentes del Dominio
import ItemCard from "../components/ItemCard";
import ItemDetails from "../components/ItemDetails";
import ItemForm from "../components/ItemForm";
import ItemFilters from "../components/ItemFilters";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import SuccessDialog from "../../../components/shared/SuccessDialog";

// Servicios y Tipos
import { itemService, type Item } from "../services/item.service";
import {
  categoryService,
  type Category,
} from "../../configuration/services/category.service";
import { authService } from "../../auth/services/auth.service";

const InventoryPage = () => {
  // --- SEGURIDAD ---
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.roleName === "ADMIN";

  // --- ESTADOS DE DATOS ---
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isHistoryMode, setIsHistoryMode] = useState(false);

  // --- ESTADOS PARA MODALES ---
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // --- ESTADO DE FILTROS ---
  const [activeFilters, setActiveFilters] = useState({
    categories: [] as number[],
    status: [] as boolean[],
    stockStatus: "all" as "all" | "low" | "enough",
  });

  // --- CONFIRMACIÓN Y ÉXITO ---
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

  // Cargar datos
  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, [isHistoryMode]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = isHistoryMode
        ? await itemService.getDeletedHistory()
        : await itemService.getAll();
      setItems(response.data);
    } catch (error) {
      console.error("Error cargando inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const resp = await categoryService.getAll();
    setCategories(resp.data);
  };

  // --- CÁLCULOS PARA TARJETAS INFORMATIVAS ---
  // Estos datos se basan en la lista total de ítems cargada
  const totalItemsCount = items.length;
  const lowStockCount = items.filter(
    (i) => i.stockQuantity <= i.minStock,
  ).length;

  // --- HANDLERS ---
  const handleView = (item: Item) => {
    setSelectedItem(item);
    setIsViewOpen(true);
  };

  const handleAddNew = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: Item) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteTrigger = (id: number) => {
    setConfirmConfig({ isOpen: true, type: "delete", data: id });
  };

  const handleSaveTrigger = (formData: any) => {
    setConfirmConfig({ isOpen: true, type: "save", data: formData });
  };

  const getDeleteHandler = () => {
    if (isHistoryMode || !isAdmin) return undefined;
    return handleDeleteTrigger;
  };

  const executeAction = async () => {
    try {
      setFormLoading(true);

      if (confirmConfig.type === "delete") {
        await itemService.delete(confirmConfig.data);
        setSuccessConfig({
          isOpen: true,
          title: "¡Eliminado!",
          desc: "El artículo ha sido retirado del inventario activo.",
        });
      } else {
        const data = confirmConfig.data;

        if (selectedItem) {
          await itemService.update(selectedItem.id, data);
          setSuccessConfig({
            isOpen: true,
            title: "¡Actualizado!",
            desc: "La información del artículo se ha actualizado correctamente.",
          });
        } else {
          await itemService.create(data);
          setSuccessConfig({
            isOpen: true,
            title: "¡Artículo Registrado!",
            desc: "El nuevo artículo ha sido añadido correctamente al inventario del club.",
          });
        }
      }

      // Cerramos el diálogo de confirmación tras el éxito
      setConfirmConfig({ ...confirmConfig, isOpen: false });
    } catch (error) {
      console.error("Error al ejecutar la acción:", error);
      alert("Error al procesar la solicitud.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessConfig({ ...successConfig, isOpen: false });
    setIsFormOpen(false);
    fetchItems();
  };

  //LÓGICA DE FILTRADO
  const filteredItems = items
    .filter((m) => {
      const searchString =
        `${m.name} ${m.categoryName} ${m.location}`.toLowerCase();
      const matchesSearch = searchString.includes(searchTerm.toLowerCase());
      const matchesCategory =
        activeFilters.categories.length === 0 ||
        activeFilters.categories.includes(m.categoryId);

      const isLow = m.stockQuantity <= m.minStock;
      const matchesStock =
        activeFilters.stockStatus === "all" ||
        (activeFilters.stockStatus === "low" && isLow) ||
        (activeFilters.stockStatus === "enough" && !isLow);

      if (isHistoryMode) return matchesSearch && matchesCategory;

      if (isAdmin) {
        if (
          activeFilters.status.length > 0 &&
          !activeFilters.status.includes(m.active)
        )
          return false;
      } else if (!m.active) {
        return false;
      }

      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      const getItemScore = (i: Item) => {
        if (!i.active) return 0;
        if (i.stockQuantity === 0) return 3;
        if (i.stockQuantity <= i.minStock) return 2;
        return 1;
      };
      return getItemScore(b) - getItemScore(a);
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          isHistoryMode ? "Historial de Inventario" : "Gestión de Inventario"
        }
        subtitle={
          isHistoryMode
            ? "Consulta de artículos dados de baja."
            : "Visualiza y controla las existencias del club."
        }
        onSearch={setSearchTerm}
        actions={
          <>
            {isHistoryMode ? (
              <Button
                variant="secondary"
                icon={<ArrowLeft size={18} />}
                onClick={() => setIsHistoryMode(false)}
              >
                Volver al listado
              </Button>
            ) : (
              <>
                <Button
                  variant={
                    activeFilters.categories.length +
                      activeFilters.status.length >
                      0 || activeFilters.stockStatus !== "all"
                      ? "primary"
                      : "secondary"
                  }
                  icon={<Filter size={18} />}
                  onClick={() => setIsFilterOpen(true)}
                >
                  Filtros
                </Button>
                {isAdmin && (
                  <>
                    <Button
                      variant="ghost"
                      icon={<History size={18} />}
                      className="!text-indigo-600 hover:!bg-indigo-50"
                      onClick={() => setIsHistoryMode(true)}
                    >
                      Ver Bajas
                    </Button>
                    <Button
                      variant="add"
                      icon={<Plus size={18} />}
                      onClick={handleAddNew}
                    >
                      Añadir Ítem
                    </Button>
                  </>
                )}
              </>
            )}
          </>
        }
      />

      {/* TARJETAS DE RESUMEN (Solo en modo normal) */}
      {!isHistoryMode && !loading && (
        <>
          {/* Nota informativa */}
          <div className="flex items-center gap-1.5 px-1 mb-2 opacity-80">
            <div className="h-1 w-1 rounded-full bg-indigo-400" />
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 italic">
              Nota: Las tarjetas resumen muestran totales globales y no se ven
              afectados por los filtros de búsqueda.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SummaryCard
              title="Total Artículos"
              value={totalItemsCount}
              icon={<Layers size={20} />}
              variant="indigo"
            />
            <SummaryCard
              title="Alertas de Stock"
              value={lowStockCount}
              icon={<AlertTriangle size={20} />}
              variant={lowStockCount > 0 ? "rose" : "emerald"}
            />
          </div>
        </>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mb-2" size={40} />
          <p className="font-medium italic">Sincronizando inventario...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onView={handleView}
                onEdit={isHistoryMode ? undefined : handleEdit}
                onDelete={getDeleteHandler()}
              />
            ))
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-100">
              <Package size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500 italic">
                No se han encontrado artículos en el inventario.
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODALES */}
      <Modal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filtros de Almacén"
        size="sm"
      >
        <ItemFilters
          filters={activeFilters}
          setFilters={setActiveFilters}
          availableCategories={categories}
          onApply={() => setIsFilterOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Detalle del Artículo"
        size="lg"
      >
        {selectedItem && <ItemDetails item={selectedItem} />}
      </Modal>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedItem ? "Editar Stock / Datos" : "Nuevo Artículo"}
      >
        <ItemForm
          initialData={selectedItem}
          onSubmit={handleSaveTrigger}
          onCancel={() => setIsFormOpen(false)}
          loading={formLoading}
        />
      </Modal>

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={executeAction}
        title={
          confirmConfig.type === "delete"
            ? "¿Confirmar baja?"
            : selectedItem
              ? "¿Guardar cambios?"
              : "¿Confirmar registro?"
        }
        description={
          confirmConfig.type === "delete"
            ? "¿Estás seguro de dar de baja este artículo?"
            : selectedItem
              ? "¿Deseas guardar los cambios realizados en este artículo?"
              : "¿Deseas registrar este nuevo artículo en el inventario del club?"
        }
        confirmLabel={
          confirmConfig.type === "delete"
            ? "Eliminar"
            : selectedItem
              ? "Guardar"
              : "Registrar Artículo"
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

export default InventoryPage;
