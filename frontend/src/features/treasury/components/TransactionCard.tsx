import React from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  User, 
  CreditCard, 
  Banknote, 
  ArrowRightLeft,
  Eye,
  Edit2,
  Trash2,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";
import Card from "../../../components/shared/Card";
import Badge from "../../../components/shared/Badge";
import Button from "../../../components/shared/Button";
import { type Transaction, TransactionType, PaymentMethod } from "../services/treasury.service";

interface TransactionCardProps {
  transaction: Transaction;
  onView: (t: Transaction) => void;
  onEdit?: (t: Transaction) => void;
  onDelete?: (id: number) => void;
  isMemberView?: boolean; 
}

const TransactionCard = ({ 
  transaction, 
  onView, 
  onEdit, 
  onDelete,
  isMemberView = false 
}: TransactionCardProps) => {
  
  const isClubIncome = transaction.type === TransactionType.INCOME;

  // LÓGICA SEMÁNTICA DE INTERCAMBIO
  const getBadgeConfig = () => {
    if (isMemberView) {
      // Caso 1: El socio pagó al club (Income para el club)
      if (isClubIncome) {
        return {
          label: "PAGO REALIZADO",
          variant: "green" as const,
          icon: <ArrowUpRight size={10} />,
          colorClass: "text-emerald-600"
        };
      } 
      // Caso 2: El club pagó al socio (Expense para el club, ingreso para el socio)
      return {
        label: "RECIBIDO / REEMBOLSO",
        variant: "blue" as const,
        icon: <ArrowDownLeft size={10} />,
        colorClass: "text-blue-600"
      };
    }

    // VISTA ADMIN (Estándar contable)
    return {
      label: isClubIncome ? "INGRESO" : "GASTO",
      variant: isClubIncome ? "green" as const : "red" as const,
      icon: isClubIncome ? <TrendingUp size={10} /> : <TrendingDown size={10} />,
      colorClass: isClubIncome ? "text-emerald-600" : "text-rose-600"
    };
  };

  const config = getBadgeConfig();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("es-ES", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  const getPaymentIcon = () => {
    switch (transaction.paymentMethod) {
      case PaymentMethod.CARD: return <CreditCard size={12} />;
      case PaymentMethod.CASH: return <Banknote size={12} />;
      case PaymentMethod.TRANSFER: return <ArrowRightLeft size={12} />;
      default: return <Wallet size={12} />;
    }
  };

  const Column = ({ title, children, className = "" }: any) => (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
        {title}
      </span>
      <div className="min-h-[20px] flex items-center">{children}</div>
    </div>
  );

  return (
    <Card className={`flex items-center gap-4 py-3 px-6 hover:border-indigo-300 transition-all shadow-sm group border-l-4 ${
      isMemberView 
        ? (isClubIncome ? "border-l-emerald-500" : "border-l-blue-500") 
        : (isClubIncome ? "border-l-emerald-500" : "border-l-rose-500")
    }`}>
      
      <div className="flex items-center justify-between flex-1 min-w-0 gap-4">
        
        {/* Usuario (Solo visible para Admin) */}
        {!isMemberView && (
          <Column title="Socio / Beneficiario" className="min-w-[150px]">
            <div className="flex items-center gap-1.5 text-indigo-600">
              <User size={14} strokeWidth={2.5} />
              <span className="text-xs font-black uppercase truncate">
                {transaction.userFullName || "GENERAL / CLUB"}
              </span>
            </div>
          </Column>
        )}

        {/* Concepto */}
        <Column title="Concepto" className="flex-1 max-w-[200px]">
          <span className="text-xs font-bold text-gray-700 truncate uppercase">
            {transaction.concept}
          </span>
        </Column>

        {/* Tipo / Estado Adaptado */}
        <Column title={isMemberView ? "Tu Movimiento" : "Tipo"} className="min-w-[130px]">
          <Badge 
            variant={config.variant}
            icon={config.icon}
          >
            {config.label}
          </Badge>
        </Column>

        {/* Importe */}
        <Column title="Importe" className="min-w-[100px]">
          <span className={`text-sm font-black ${config.colorClass}`}>
            {!isMemberView && (isClubIncome ? "+" : "-")} {formatCurrency(transaction.amount)}
          </span>
        </Column>

        {/* Método */}
        <Column title="Método" className="min-w-[100px]">
          <div className="flex items-center gap-1.5 text-gray-500">
            {getPaymentIcon()}
            <span className="text-[10px] font-black uppercase">{transaction.paymentMethod}</span>
          </div>
        </Column>

        {/* Fecha */}
        <Column title="Fecha y Hora" className="min-w-[120px]">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Calendar size={12} />
            <span className="text-[10px] font-bold">{formatDateTime(transaction.transactionDate)}</span>
          </div>
        </Column>
      </div>

      {/* Botones de Acción */}
      <div className="flex items-center gap-1 shrink-0 ml-4">
        <Button
          variant="ghost"
          size="sm"
          icon={<Eye size={16} />}
          onClick={() => onView(transaction)}
          className="!text-blue-600 hover:!bg-blue-50"
        />
        
        {!isMemberView && (
          <>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                icon={<Edit2 size={16} />}
                onClick={() => onEdit(transaction)}
                className="!text-amber-500 hover:!bg-amber-50"
              />
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                icon={<Trash2 size={16} />}
                onClick={() => onDelete(transaction.id)}
                className="!text-red-500 hover:!bg-red-50"
              />
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default TransactionCard;