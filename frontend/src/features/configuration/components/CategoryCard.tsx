import React from "react";
import { 
  Tag, 
  Edit2, 
  Trash2, 
  Eye, 
  Package, 
  Info 
} from "lucide-react";
import Card from "../../../components/shared/Card";
import Badge from "../../../components/shared/Badge";
import Button from "../../../components/shared/Button";
import { type Category } from "../services/category.service";

interface CategoryCardProps {
  category: any; // Usamos any o extendemos la interfaz Category para incluir itemCount
  onView: (category: any) => void;
  onEdit?: (category: any) => void;
  onDelete?: (id: number) => void;
}

const CategoryCard = ({ 
  category, 
  onView, 
  onEdit, 
  onDelete 
}: CategoryCardProps) => {
  
  const hasItems = (category.itemCount || 0) > 0;

  return (
    <Card className="flex flex-col gap-4 py-4 px-6 hover:border-indigo-300 transition-all shadow-sm group relative overflow-hidden">
      {/* Indicador lateral de estado */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${category.active ? "bg-indigo-500" : "bg-gray-300"}`} />

      {/* CABECERA: Icono + Info + Botones */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2.5 rounded-xl shrink-0 ${category.active ? "bg-indigo-50 text-indigo-600" : "bg-gray-50 text-gray-400"}`}>
            <Tag size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight truncate">
              {category.name}
            </h3>
            <p className="text-[10px] text-gray-400 font-medium">
              ID Categoría: #{category.id}
            </p>
          </div>
        </div>

        {/* ACCIONES (Se muestran siempre en móvil, hover en desktop) */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye size={16} />}
            onClick={() => onView(category)}
            className="!text-blue-600 hover:!bg-blue-50"
            title="Ver detalles"
          />
          
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Edit2 size={16} />}
              onClick={() => onEdit(category)}
              className="!text-amber-500 hover:!bg-amber-50"
              title="Editar categoría"
            />
          )}

          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 size={16} />}
              onClick={() => onDelete(category.id)}
              disabled={hasItems}
              className="!text-red-500 hover:!bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
              title={hasItems ? `No puedes eliminar una categoría con ${category.itemCount} productos` : "Eliminar categoría"}
            />
          )}
        </div>
      </div>

      {/* CUERPO: Descripción */}
      <div className="flex-1">
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 italic">
          {category.description || "Sin descripción definida para esta categoría."}
        </p>
      </div>

      {/* FOOTER: Contador de Items*/}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Productos Vinculados:
        </span>
        
        <div className="flex items-center gap-1.5">
          {hasItems ? (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full">
              <Package size={10} className="text-indigo-500" />
              <span className="text-[10px] font-black uppercase">
                {category.itemCount} {category.itemCount === 1 ? 'Ítem' : 'Ítems'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-400 border border-gray-100 rounded-full">
              <Package size={10} />
              <span className="text-[10px] font-bold uppercase tracking-tight">Vacía</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CategoryCard;