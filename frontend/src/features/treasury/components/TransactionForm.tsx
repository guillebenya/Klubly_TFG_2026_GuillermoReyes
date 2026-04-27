import React, { useState, useEffect } from "react";
import { Euro, FileText, Calendar, CreditCard, Tag, User, X } from "lucide-react";
import Button from "../../../components/shared/Button";
import { TransactionType, PaymentMethod } from "../services/treasury.service";
import { userService } from "../../identity/services/user.service";

interface TransactionFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

const TransactionForm = ({ initialData, onSubmit, onCancel, loading }: TransactionFormProps) => {
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    amount: "",
    concept: "",
    transactionDate: new Date().toISOString().slice(0, 16), // Formato para datetime-local
    type: TransactionType.INCOME as string,
    paymentMethod: PaymentMethod.CASH as string,
    userId: "",
  });

  useEffect(() => {
    // Cargar usuarios para el desplegable (opcional vincular a socio)
    const fetchUsers = async () => {
      const resp = await userService.getAll();
      setUsers(resp.data);
    };
    fetchUsers();

    if (initialData) {
      setFormData({
        amount: initialData.amount.toString(),
        concept: initialData.concept,
        transactionDate: new Date(initialData.transactionDate).toISOString().slice(0, 16),
        type: initialData.type,
        paymentMethod: initialData.paymentMethod,
        userId: initialData.userId?.toString() || "",
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      userId: formData.userId ? parseInt(formData.userId) : null,
      transactionDate: new Date(formData.transactionDate).toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Concepto */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Concepto del Movimiento</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              required
              value={formData.concept}
              onChange={(e) => setFormData({...formData, concept: e.target.value})}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
              placeholder="Ej: Pago Cuota Mensual Mayo"
            />
          </div>
        </div>

        {/* Socio Vinculado (Opcional) */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Socio / Usuario (Opcional)</label>
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={18} />
            <select
              value={formData.userId}
              onChange={(e) => setFormData({...formData, userId: e.target.value})}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none"
            >
              <option value="">Gasto/Ingreso General (Club)</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.username})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Importe */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Importe (€)</label>
          <div className="relative">
            <Euro className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-black text-indigo-600"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Fecha y Hora */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Fecha y Hora</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="datetime-local"
              required
              value={formData.transactionDate}
              onChange={(e) => setFormData({...formData, transactionDate: e.target.value})}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>
        </div>

        {/* Tipo de Transacción */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Tipo</label>
          <div className="relative">
            <Tag className="absolute left-3 top-3 text-gray-400" size={18} />
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none"
            >
              <option value={TransactionType.INCOME}>INGRESO</option>
              <option value={TransactionType.EXPENSE}>GASTO</option>
            </select>
          </div>
        </div>

        {/* Método de Pago */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Método de Pago</label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-3 text-gray-400" size={18} />
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none"
            >
              <option value={PaymentMethod.CASH}>EFECTIVO</option>
              <option value={PaymentMethod.CARD}>TARJETA</option>
              <option value={PaymentMethod.TRANSFER}>TRANSFERENCIA</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-6 flex items-center justify-end gap-3 border-t border-gray-100">
        <Button type="button" variant="secondary" onClick={onCancel} icon={<X size={18} />}>Cancelar</Button>
        <Button type="submit" variant="primary" isLoading={loading}>
          {initialData ? "Guardar Cambios" : "Registrar Movimiento"}
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;