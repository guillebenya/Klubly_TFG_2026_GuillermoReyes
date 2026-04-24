import React, { useState, useEffect } from "react";
import {
  Package,
  Tag,
  MapPin,
  AlertCircle,
  Info,
  Layers,
  X,
} from "lucide-react";
import Button from "../../../components/shared/Button";
import { categoryService, type Category } from "../services/category.service";
import { authService } from "../../auth/services/auth.service";

interface ItemFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

const ItemForm = ({
  initialData,
  onSubmit,
  onCancel,
  loading,
}: ItemFormProps) => {
  // --- SEGURIDAD Y PERMISOS ---
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.roleName === "ADMIN";

  // --- ESTADOS ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    stockQuantity: 0,
    minStock: 0,
    location: "",
    categoryId: "",
    active: true,
  });

  // Cargar categorías al inicio
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const resp = await categoryService.getAll();
        setCategories(resp.data);
        
        // Si no hay categoría seleccionada y hay disponibles, poner la primera por defecto
        if (!initialData && resp.data.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: resp.data[0].id.toString() }));
        }
      } catch (error) {
        console.error("Error cargando categorías:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCats();
  }, [initialData]);

  // Sincronizar datos iniciales si estamos editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        stockQuantity: initialData.stockQuantity || 0,
        minStock: initialData.minStock || 0,
        location: initialData.location || "",
        categoryId: initialData.categoryId?.toString() || "",
        active: initialData.active ?? true,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const val = type === "number" ? parseInt(value) || 0 : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convertimos el categoryId a número antes de enviar al backend
    const dataToSubmit = {
      ...formData,
      categoryId: parseInt(formData.categoryId as string),
    };
    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Nombre del Artículo */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">
            Nombre del Producto
          </label>
          <div className="relative">
            <Package className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isAdmin && !!initialData} // STAFF no suele cambiar nombres de items existentes
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-semibold"
              placeholder="Ej: Balón de Baloncesto Molten G7"
              required
            />
          </div>
        </div>

        {/* Categoría */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">
            Categoría
          </label>
          <div className="relative">
            <Layers className="absolute left-3 top-3 text-gray-400" size={18} />
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              disabled={!isAdmin && !!initialData}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none cursor-pointer"
              required
            >
              {loadingCategories ? (
                <option>Cargando...</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name.toUpperCase()}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Ubicación */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">
            Ubicación en Almacén
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
              placeholder="Ej: Estantería B-4"
            />
          </div>
        </div>

        {/* Stock Actual */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">
            Stock Actual
          </label>
          <div className="relative">
            <input
              type="number"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2.5 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-black text-indigo-600"
              required
            />
          </div>
          <p className="text-[9px] text-gray-400 italic ml-1">Unidades físicas disponibles ahora.</p>
        </div>

        {/* Stock Mínimo (RESTRINGIDO A ADMIN) */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">
            Stock Mínimo {!isAdmin && "(Solo Admin)"}
          </label>
          <div className="relative">
            <input
              type="number"
              name="minStock"
              value={formData.minStock}
              onChange={handleChange}
              min="0"
              disabled={!isAdmin} // <--- BLOQUEO STAFF
              className={`w-full px-4 py-2.5 border rounded-xl outline-none transition-all text-sm font-bold
                ${!isAdmin ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-white border-amber-200 text-amber-600 focus:ring-2 focus:ring-amber-500"}`}
              required
            />
          </div>
          <p className="text-[9px] text-gray-400 italic ml-1">Umbral para alertas de reposición.</p>
        </div>

        {/* Descripción */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">
            Descripción y Notas
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm min-h-[80px]"
            placeholder="Detalles adicionales del artículo..."
          />
        </div>

        {/* Estado Activo (Toggle) */}
        <div className="md:col-span-2 flex items-center gap-3 py-2 ml-1">
          <div
            onClick={() => isAdmin && setFormData({ ...formData, active: !formData.active })}
            className={`w-10 h-5 rounded-full relative transition-colors duration-200 
              ${formData.active ? "bg-indigo-600" : "bg-gray-300"} 
              ${!isAdmin ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div
              className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 ${formData.active ? "left-6" : "left-1"}`}
            />
          </div>
          <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">
            Artículo Activo {formData.active ? "" : "(Fuera de catálogo)"}
          </span>
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="pt-6 flex items-center justify-end gap-3 border-t border-gray-100">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
          icon={<X size={18} />}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={loading}>
          {initialData ? "Guardar Cambios" : "Añadir al Inventario"}
        </Button>
      </div>
    </form>
  );
};

export default ItemForm;