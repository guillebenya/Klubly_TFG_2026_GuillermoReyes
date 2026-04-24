import React from "react";
import { type Item } from "../services/item.service";
import {
  Package,
  MapPin,
  Tag,
  Calendar,
  Clock,
  Info,
  ShieldAlert,
} from "lucide-react";
import Badge from "../../../components/shared/Badge";
import { authService } from "../../auth/services/auth.service";

const ItemDetails = ({ item }: { item: Item }) => {
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.roleName === "ADMIN";

  const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleString("es-ES") : "---";

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Package size={28} />
          </div>
          <div>
            <h4 className="text-xl font-black text-gray-900 leading-tight uppercase">
              {item.name}
            </h4>
            <p className="text-xs text-indigo-600 font-bold uppercase flex items-center gap-1 mt-1">
              <Tag size={12} /> {item.categoryName}
            </p>
          </div>
        </div>
        <Badge variant={item.active ? "green" : "red"}>
          {item.active ? "DISPONIBLE" : "NO DISPONIBLE"}
        </Badge>
      </div>

      {/* Datos Clave */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
            Ubicación Almacén
          </span>
          <div className="flex items-center gap-2 text-gray-700 font-bold">
            <MapPin size={16} className="text-indigo-500" />
            {item.location || "Sin ubicación definida"}
          </div>
        </div>
        <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
            Gestión de Stock
          </span>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-400 uppercase">Actual</p>
              <p
                className={`text-lg font-black ${item.stockQuantity <= item.minStock ? "text-red-500" : "text-gray-800"}`}
              >
                {item.stockQuantity} uds.
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase">Mínimo</p>
              <p className="text-sm font-bold text-gray-600">
                {item.minStock} uds.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="p-5 bg-gray-50 border border-gray-100 rounded-xl">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
          <Info size={12} /> Descripción del artículo
        </span>
        <p className="text-sm text-gray-600 leading-relaxed italic">
          {item.description || "Sin descripción adicional."}
        </p>
      </div>

      {/* Auditoría (SOLO ADMIN) */}
      {isAdmin && (
        <div className="p-4 bg-slate-900 rounded-2xl">
          <div className="flex items-center gap-2 mb-4 text-indigo-400">
            <ShieldAlert size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Panel de Auditoría
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Calendar size={10} /> Registrado el
              </span>
              <span className="text-[11px] font-medium text-white mt-1">
                {formatDate(item.createdAt)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Clock size={10} /> Última actualización
              </span>
              <span className="text-[11px] font-medium text-white mt-1">
                {formatDate(item.updatedAt)}
              </span>
            </div>
          </div>
          {item.deletedAt && (
            <div className="mt-4 pt-3 border-t border-slate-800">
              <span className="text-[9px] font-bold text-red-400 uppercase">
                Fecha de Baja definitiva: {formatDate(item.deletedAt)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemDetails;
