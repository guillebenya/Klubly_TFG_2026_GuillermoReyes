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
  const isOutOfStock = item.stockQuantity === 0;

  return (
    <Card
      className={`flex items-center gap-4 py-3 px-6 transition-all shadow-sm group relative border-l-4 ${item.active ? "" : "opacity-65"} ${
        isOutOfStock
          ? "border-l-red-300 hover:border-red-500 bg-red-50/10"
          : isLowStock ? "border-l-amber-300 hover:border-amber-600 bg-amber-50/10" : item.active ? "border-l-indigo-300 hover:border-indigo-600" : "border-l-gray-300 hover:border-gray-600"
      }`}
    >
      {/* Icono Principal con Badge de Alerta superpuesto */}
      <div className="relative">
        <div
          className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
            isOutOfStock
              ? "bg-red-100 border-red-200 text-red-600 shadow-sm"
              : isLowStock ? "bg-amber-100 border-amber-200 text-amber-600" : item.active ? "bg-indigo-50 border-indigo-100 text-indigo-600" : "bg-gray-100 border-gray-100 text-gray-600"
          }`}
        >
          <Package size={24} />
        </div>
        {isLowStock && (
          <div className={`absolute -top-1 -right-1 text-white rounded-full p-0.5 shadow-sm animate-bounce ${isOutOfStock ? "bg-red-600" : "bg-amber-600"}`}>
            <AlertTriangle size={10} />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between flex-1 min-w-0 gap-4">
        {/* Nombre e Info Básica */}
        <div className="flex flex-col min-w-[180px] max-w-[220px]">
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

        {/* Stock Actual*/}
        <div className="hidden md:flex flex-col items-center min-w-[110px] relative group/stock">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
            Stock Actual
          </span>
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1.5">
              <span
                className={`text-base font-black ${isLowStock ? "text-red-600" : "text-gray-700"}`}
              >
                {item.stockQuantity}
              </span>
              {isLowStock && (
                <AlertTriangle
                  size={14}
                  className={`animate-pulse ${isOutOfStock ? "text-red-600" : "text-amber-600"}`}
                />
              )}
            </div>

            {/* Texto de aviso fijo cuando es bajo mínimos */}
            {isLowStock && (
              <span className={`text-[9px] font-black uppercase tracking-tighter animate-pulse ${isOutOfStock ? "text-red-600" : "text-amber-600"}`}>
                {isOutOfStock ? "Agotado" : "Vigilar Stock"}
              </span>
            )}
          </div>

          {/* Tooltip en Hover para explicar el mínimo */}
          {isLowStock && (
            <div className="absolute bottom-full mb-2 hidden group-hover/stock:block w-32 p-2 bg-gray-900 text-white text-[10px] rounded-lg shadow-xl z-10 text-center">
              {isOutOfStock ? "Stock agotado" : "Stock por debajo del mínimo"}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
            </div>
          )}
        </div>

        {/* Stock Mínimo */}
        <div className="hidden lg:flex flex-col items-center min-w-[80px]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
            Mínimo
          </span>
          <p
            className={`text-sm font-semibold ${isLowStock ? "text-gray-900" : "text-gray-500"}`}
          >
            {item.minStock}
          </p>
        </div>

        {/* Ubicación */}
        <div className="hidden xl:flex flex-col items-start min-w-[120px]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
            Ubicación
          </span>
          <div className="flex items-center gap-1 text-gray-600">
            <MapPin
              size={12}
              className={isLowStock ? "text-red-400" : "text-indigo-500"}
            />
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
      <div className="flex items-center gap-1 shrink-0 ml-4 ">
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
            aria-label="Eliminar"
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
