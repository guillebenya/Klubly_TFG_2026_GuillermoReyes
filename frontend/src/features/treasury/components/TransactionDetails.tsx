// src/features/treasury/components/TransactionDetails.tsx
import React from "react";
import { Calendar, User, Tag, CreditCard, DollarSign, Clock, History } from "lucide-react";
import { type Transaction, TransactionType } from "../services/treasury.service";
import { authService } from "../../auth/services/auth.service";

const TransactionDetails = ({ transaction }: { transaction: Transaction }) => {
  const isAdmin = authService.getCurrentUser()?.roleName === "ADMIN";
  const isIncome = transaction.type === TransactionType.INCOME;

  const formatDate = (dateStr?: string) => 
    dateStr ? new Date(dateStr).toLocaleString("es-ES") : "N/A";

  const DetailItem = ({ icon: Icon, label, value, color = "text-gray-600" }: any) => (
    <div className="flex flex-col gap-1 p-3 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
        <Icon size={14} /> {label}
      </div>
      <div className={`text-sm font-bold ${color}`}>{value}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* SECCIÓN PÚBLICA (Admin y Member) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <DetailItem icon={Tag} label="Concepto" value={transaction.concept} color="text-indigo-600 uppercase" />
        <DetailItem 
          icon={DollarSign} 
          label="Importe" 
          value={`${isIncome ? "+" : "-"} ${transaction.amount.toFixed(2)} €`} 
          color={isIncome ? "text-emerald-600" : "text-rose-600"} 
        />
        <DetailItem icon={Calendar} label="Fecha de Operación" value={formatDate(transaction.transactionDate)} />
        <DetailItem icon={CreditCard} label="Método de Pago" value={transaction.paymentMethod} />
      </div>

      {/* SECCIÓN SOLO ADMIN (Auditoría y Socio) */}
      {isAdmin && (
        <div className="pt-4 border-t border-gray-100 space-y-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Información de Gestión</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <DetailItem icon={User} label="Socio Vinculado" value={transaction.userFullName || "MOVIMIENTO GENERAL"} />
            <DetailItem icon={Clock} label="Registro en Sistema" value={formatDate(transaction.createdAt)} />
            {transaction.deletedAt && (
              <DetailItem icon={History} label="Fecha de Baja" value={formatDate(transaction.deletedAt)} color="text-red-500" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionDetails;