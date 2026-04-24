import React from "react";
import {
  Package,
  MapPin,
  Tag,
  AlertTriangle,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Card from "../../../components/shared/Card";
import Badge from "../../../components/shared/Badge";
import Button from "../../../components/shared/Button";
import { authService } from "../../auth/services/auth.service";
import { type Item } from "../services/item.service";

interface ItemCardProps {
  item: Item;
  onView: (item: Item) => void;
  onEdit?: (item: Item) => void;
  onDelete?: (id: number) => void;
}

const ItemCard = ({ item, onView, onEdit, onDelete }: ItemCardProps) => {
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.roleName === "ADMIN";

  // Lógica de Stock Bajo
  const isLowStock = item.stockQuantity <= item.minStock;

  return (
    <Card className="flex items-center gap-4 py-3 px-6 hover:border-indigo-300 transition-all shadow-sm group">
      {/* Icono Principal (Caja) */}
      <div
        className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
          isLowStock
            ? "bg-red-50 border-red-100 text-red-500"
            : "bg-indigo-50 border-indigo-100 text-indigo-600"
        }`}
      >
        <Package size={24} />
      </div>

      {/* Información en Fila (Similar a Members) */}
      <div className="flex items-center justify-between flex-1 min-w-0 gap-4">
        {/* Nombre y Descripción corta */}
        <div className="flex flex-col min-w-[200px] max-w-[250px]">
          <p className="text-sm font-bold text-gray-900 truncate uppercase tracking-tight">
            {item.name}
          </p>
          <div className="flex items-center gap-1 text-gray-400">
            <Tag size={12} />
            <span className="text-[10px] font-bold uppercase truncate">
              {item.categoryName || "Sin Categoría"}
            </span>
          </div>
        </div>

        {/* Stock Actual - Con alerta visual */}
        <div className="hidden md:flex flex-col items-center min-w-[100px]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
            Stock Actual
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-sm font-black ${isLowStock ? "text-red-600" : "text-gray-700"}`}
            >
              {item.stockQuantity}
            </span>
            {isLowStock && (
              <AlertTriangle size={14} className="text-red-500 animate-pulse" />
            )}
          </div>
        </div>

        {/* Stock Mínimo (Solo informativo) */}
        <div className="hidden lg:flex flex-col items-center min-w-[80px]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
            Mínimo
          </span>
          <p className="text-xs font-semibold text-gray-500">{item.minStock}</p>
        </div>

        {/* Ubicación */}
        <div className="hidden xl:flex flex-col items-start min-w-[120px]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
            Ubicación
          </span>
          <div className="flex items-center gap-1 text-gray-600">
            <MapPin size={12} className="text-indigo-500" />
            <p className="text-xs font-medium truncate">
              {item.location || "No asignada"}
            </p>
          </div>
        </div>

        {/* Estado */}
        <div className="hidden sm:flex flex-col items-start min-w-[90px]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
            Estado
          </span>
          <Badge
            variant={item.active ? "green" : "red"}
            icon={
              item.active ? <CheckCircle2 size={10} /> : <XCircle size={10} />
            }
          >
            {item.active ? "ACTIVO" : "INACTIVO"}
          </Badge>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1 shrink-0 ml-4 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          icon={<Eye size={16} />}
          onClick={() => onView(item)}
          className="!text-blue-600 hover:!bg-blue-50"
          title="Ver ficha completa"
        />

        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            icon={<Edit2 size={16} />}
            onClick={() => onEdit(item)}
            className="!text-amber-500 hover:!bg-amber-50"
            title="Editar stock o datos"
          />
        )}

        {isAdmin && onDelete && (
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 size={16} />}
            onClick={() => onDelete(item.id)}
            className="!text-red-500 hover:!bg-red-50"
            title="Dar de baja producto"
          />
        )}
      </div>
    </Card>
  );
};

export default ItemCard;
