import React from "react";
import { 
  Calendar, 
  User, 
  Tag, 
  CreditCard, 
  Clock, 
  History, 
  Euro, 
  Trash2,
  RefreshCcw,
  Shield,
  FileText,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";
import { type Transaction, TransactionType } from "../services/treasury.service";
import { authService } from "../../auth/services/auth.service";
import Badge from "../../../components/shared/Badge";

const TransactionDetails = ({ transaction }: { transaction: Transaction }) => {
  const isAdmin = authService.getCurrentUser()?.roleName === "ADMIN";
  const isClubIncome = transaction.type === TransactionType.INCOME;

  // --- LÓGICA DE PERSPECTIVA TOTAL ---
  const getVisualConfig = () => {
    if (!isAdmin) {
      // PERSPECTIVA SOCIO (MEMBER)
      return {
        symbol: isClubIncome ? "-" : "+",
        color: isClubIncome ? "text-rose-600" : "text-emerald-600", // Pago es rojo (sale), Reembolso es verde (entra)
        headerBg: isClubIncome ? "bg-rose-600 shadow-rose-100" : "bg-emerald-600 shadow-emerald-100",
        label: isClubIncome ? "Pago Realizado" : "Reembolso / Recibido",
        badgeText: isClubIncome ? "GASTO" : "INGRESO",
        regLabel: "Tipo de Transacción",
        regValue: isClubIncome ? "PAGO REALIZADO" : "RECIBIDO / REEMBOLSO",
        badgeVariant: isClubIncome ? "red" as const : "green" as const
      };
    }
    // PERSPECTIVA ADMINISTRADOR
    return {
      symbol: isClubIncome ? "+" : "-",
      color: isClubIncome ? "text-emerald-600" : "text-rose-600",
      headerBg: isClubIncome ? "bg-emerald-600 shadow-emerald-100" : "bg-rose-600 shadow-rose-100",
      label: "Importe",
      badgeText: isClubIncome ? "INGRESO" : "GASTO",
      regLabel: "Tipo de Transacción",
      regValue: isClubIncome ? "INGRESO CLUB" : "GASTO CLUB",
      badgeVariant: isClubIncome ? "red" as const : "green" as const
    };
  };

  const config = getVisualConfig();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const DetailItem = ({ icon: Icon, label, value, color = "text-gray-600" }: any) => (
    <div className="flex flex-col gap-1 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
        <Icon size={12} /> {label}
      </div>
      <div className={`text-sm font-bold ${color}`}>{value}</div>
    </div>
  );

  return (
    <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
      
      {/* CABECERA DE ESTADO (Estilo Invertido según Rol) */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-4">
          <div className={`h-14 w-14 rounded-xl flex items-center justify-center shadow-lg transition-colors ${config.headerBg}`}>
            <FileText className="text-white" size={24} />
          </div>
          <div>
            <h4 className="text-lg font-black text-gray-900 leading-tight uppercase">
              {transaction.concept}
            </h4>
            <div className="flex items-center gap-2 text-gray-500 mt-1">
              <span className="text-sm font-bold">ID Transacción: #{transaction.id}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={transaction.active ? "green" : "red"}>
            {transaction.active ? "ACTIVA" : "INACTIVA"}
          </Badge>
          <Badge variant={config.badgeVariant} icon={<Shield size={10} />}>
            {config.badgeText}
          </Badge>
        </div>
      </div>

      {/* SECCIÓN PRINCIPAL: DATOS DE LA OPERACIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailItem 
          icon={Euro} 
          label={config.label} 
          value={`${config.symbol} ${transaction.amount.toFixed(2)} €`} 
          color={config.color} 
        />
        
        <DetailItem 
          icon={Calendar} 
          label="Fecha de Operación" 
          value={formatDate(transaction.transactionDate)} 
        />
        
        <DetailItem 
          icon={CreditCard} 
          label="Método de Pago" 
          value={transaction.paymentMethod} 
        />

        <DetailItem 
          icon={Tag} 
          label={config.regLabel} 
          value={config.regValue} 
          color="text-indigo-600"
        />
      </div>

      {/* SECCIÓN DE GESTIÓN (Solo ADMIN) */}
      {isAdmin && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <User size={12} /> Socio vinculado
            </label>
            <p className="text-sm font-bold text-indigo-600 uppercase">
              {transaction.userFullName || "Movimiento General del Club"}
            </p>
          </div>

          <div
            className={`p-4 bg-slate-900 rounded-2xl grid gap-4 ${
              transaction.deletedAt ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Calendar size={10} /> Registrado el
              </span>
              <span className="text-[11px] font-medium text-white mt-1">
                {formatDate(transaction.createdAt)}
              </span>
            </div>

            <div className="flex flex-col border-t border-slate-800 sm:border-t-0 sm:border-l sm:pl-4 pt-3 sm:pt-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <RefreshCcw size={10} /> Último cambio
              </span>
              <span className="text-[11px] font-medium text-white mt-1">
                {formatDate(transaction.updatedAt)}
              </span>
            </div>

            {transaction.deletedAt && (
              <div className="flex flex-col border-t border-slate-800 sm:border-t-0 sm:border-l sm:pl-4 pt-3 sm:pt-0">
                <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Trash2 size={10} /> Eliminado el
                </span>
                <span className="text-[11px] font-medium text-red-400 mt-1">
                  {formatDate(transaction.deletedAt)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionDetails;