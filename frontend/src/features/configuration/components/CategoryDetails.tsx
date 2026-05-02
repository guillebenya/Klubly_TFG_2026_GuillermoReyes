import React from "react";
import { Tag, Calendar, Clock, Trash2, Info, Package } from "lucide-react";
import Badge from "../../../components/shared/Badge";
import { type Category } from "../services/category.service";

interface CategoryDetailsProps {
  category: any; // Usamos any para incluir el itemCount del DTO
}

const CategoryDetails = ({ category }: CategoryDetailsProps) => {
  const formatDate = (dateString?: string) =>
    dateString ? new Date(dateString).toLocaleString("es-ES") : "---";

  return (
    <div className="space-y-6">
      {/* HEADER DE LA FICHA */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Tag size={28} />
          </div>
          <div>
            <h4 className="text-base font-black text-gray-900 leading-tight">
              {category.name}
            </h4>
            <span className="text-xs font-bold uppercase tracking-tight">
              ID de la categoría: #{category.id}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={category.active ? "green" : "red"}>
            {category.active ? "ACTIVA" : "INACTIVA"}
          </Badge>
          <div className="px-3 py-1 bg-white border border-indigo-200 rounded-lg text-[10px] font-black text-indigo-600 shadow-sm uppercase flex items-center gap-1.5 whitespace-nowrap w-fit">
            <Package size={12} className="shrink-0" />
            <span>
              {category.itemCount || 0}{" "}
              {category.itemCount === 1 ? "Producto" : "Productos"}
            </span>
          </div>
        </div>
      </div>

      {/* DESCRIPCIÓN */}
      <div className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
          <Info size={12} /> Descripción
        </label>
        <p className="text-sm font-medium text-gray-600 leading-relaxed italic bg-slate-50 p-4 rounded-lg border border-slate-100">
          "
          {category.description ||
            "No hay descripción definida para esta categoría."}
          "
        </p>
      </div>

      {/* SECCIÓN DE AUDITORÍA*/}
      <div
        className={`p-4 bg-slate-900 rounded-2xl grid gap-4 ${
          category.deletedAt ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"
        }`}
      >
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Calendar size={10} /> Registrado el
          </span>
          <span className="text-[11px] font-medium text-white mt-1">
            {formatDate(category.createdAt)}
          </span>
        </div>

        <div className="flex flex-col border-t border-slate-800 sm:border-t-0 sm:border-l sm:pl-4 pt-3 sm:pt-0">
          <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Clock size={10} /> Último cambio
          </span>
          <span className="text-[11px] font-medium text-white mt-1">
            {formatDate(category.updatedAt)}
          </span>
        </div>

        {category.deletedAt && (
          <div className="flex flex-col border-t border-slate-800 sm:border-t-0 sm:border-l sm:pl-4 pt-3 sm:pt-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Trash2 size={10} /> Eliminado el
            </span>
            <span
              className={`text-[11px] font-medium mt-1 ${
                category.deletedAt ? "text-red-400" : "text-slate-500 italic"
              }`}
            >
              {category.deletedAt
                ? formatDate(category.deletedAt)
                : "Categoría activa en sistema"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDetails;
