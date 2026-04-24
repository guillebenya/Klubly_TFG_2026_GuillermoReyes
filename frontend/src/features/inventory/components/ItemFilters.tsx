import React from "react";
import { 
  Tag, 
  Activity, 
  AlertTriangle, 
  RotateCcw, 
  Layers,
  CheckCircle2
} from "lucide-react";
import Button from "../../../components/shared/Button";
import { type Category } from "../../configuration/services/category.service";
import { authService } from "../../auth/services/auth.service";

interface ItemFiltersProps {
  filters: {
    categories: number[];
    status: boolean[];
    stockStatus: "all" | "low" | "enough";
  };
  setFilters: (filters: any) => void;
  availableCategories: Category[];
  onApply: () => void;
}

const ItemFilters = ({
  filters,
  setFilters,
  availableCategories,
  onApply,
}: ItemFiltersProps) => {
  // --- CONTROL DE PERMISOS ---
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.roleName === "ADMIN";

  const toggleCategory = (id: number) => {
    const current = [...filters.categories];
    const index = current.indexOf(id);
    if (index > -1) current.splice(index, 1);
    else current.push(id);
    setFilters({ ...filters, categories: current });
  };

  const toggleStatus = (val: boolean) => {
    const current = [...filters.status];
    const index = current.indexOf(val);
    if (index > -1) current.splice(index, 1);
    else current.push(val);
    setFilters({ ...filters, status: current });
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      status: [],
      stockStatus: "all",
    });
  };

  return (
    <div className="space-y-6">
      {/* SECCIÓN 1: ESTADO DE EXISTENCIAS (Visible para todos) */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <AlertTriangle size={14} /> Nivel de Stock
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "all", label: "TODOS", color: "indigo" },
            { id: "low", label: "BAJO MÍN.", color: "red" },
            { id: "enough", label: "SUFICIENTE", color: "emerald" },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFilters({ ...filters, stockStatus: opt.id })}
              className={`py-2 rounded-xl text-[10px] font-black border transition-all ${
                filters.stockStatus === opt.id
                  ? `border-${opt.color}-500 bg-${opt.color}-50 text-${opt.color}-700 shadow-sm`
                  : "border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECCIÓN 2: DISPONIBILIDAD (SOLO ADMIN) */}
      {isAdmin && (
        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Activity size={14} /> Estado del Artículo
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => toggleStatus(true)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                filters.status.includes(true)
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-gray-100 bg-gray-50 text-gray-400"
              }`}
            >
              ACTIVOS
            </button>
            <button
              type="button"
              onClick={() => toggleStatus(false)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                filters.status.includes(false)
                  ? "border-gray-400 bg-gray-100 text-gray-600"
                  : "border-gray-100 bg-gray-50 text-gray-400"
              }`}
            >
              INACTIVOS
            </button>
          </div>
          <p className="text-[9px] text-gray-400 italic px-1">
            * El Staff solo visualiza artículos activos por defecto.
          </p>
        </div>
      )}

      {/* SECCIÓN 3: CATEGORÍAS (Visible para todos) */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Layers size={14} /> Categorías
        </label>
        <div className="max-h-48 overflow-y-auto pr-2 space-y-1 custom-scrollbar border border-gray-50 rounded-xl p-2 bg-gray-50/30">
          {availableCategories.length > 0 ? (
            availableCategories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                  filters.categories.includes(cat.id)
                    ? "bg-white shadow-sm ring-1 ring-indigo-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Tag size={12} className={filters.categories.includes(cat.id) ? "text-indigo-500" : "text-gray-400"} />
                  <span className={`text-xs font-bold ${filters.categories.includes(cat.id) ? "text-gray-900" : "text-gray-500"}`}>
                    {cat.name}
                  </span>
                </div>
                {filters.categories.includes(cat.id) && (
                  <CheckCircle2 size={14} className="text-indigo-600" />
                )}
              </div>
            ))
          ) : (
            <p className="text-[10px] text-gray-400 italic text-center py-4">No hay categorías disponibles</p>
          )}
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
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

export default ItemFilters;