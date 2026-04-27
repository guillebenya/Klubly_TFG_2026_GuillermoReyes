import React from "react";
import { Calendar, DollarSign, Tag, CreditCard, RotateCcw, Euro } from "lucide-react";
import Button from "../../../components/shared/Button";
import { TransactionType, PaymentMethod } from "../services/treasury.service";

interface TransactionFiltersProps {
  filters: any;
  setFilters: (f: any) => void;
  onApply: () => void;
}

const TransactionFilters = ({ filters, setFilters, onApply }: TransactionFiltersProps) => {

  const toggleList = (category: string, value: string) => {
    const current = [...filters[category]];
    const index = current.indexOf(value);
    if (index > -1) current.splice(index, 1);
    else current.push(value);
    setFilters({ ...filters, [category]: current });
  };

  const clearFilters = () => {
    setFilters({
      dateStart: "",
      dateEnd: "",
      types: [],
      methods: [],
      minAmount: "",
      maxAmount: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* RANGO DE FECHAS */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Calendar size={14} /> Rango de Fechas
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={filters.dateStart}
            onChange={(e) => setFilters({...filters, dateStart: e.target.value})}
            className="text-xs p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="date"
            value={filters.dateEnd}
            onChange={(e) => setFilters({...filters, dateEnd: e.target.value})}
            className="text-xs p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* TIPO DE TRANSACCIÓN */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Tag size={14} /> Tipo de Movimiento
        </label>
        <div className="flex gap-2">
          {Object.values(TransactionType).map((type) => (
            <button
              key={type}
              onClick={() => toggleList("types", type)}
              className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all border ${
                filters.types.includes(type)
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                  : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* MÉTODO DE PAGO */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <CreditCard size={14} /> Método de Pago
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.values(PaymentMethod).map((method) => (
            <button
              key={method}
              onClick={() => toggleList("methods", method)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                filters.methods.includes(method)
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* RANGO DE IMPORTE */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Euro size={14} /> Rango de Importe (€)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minAmount}
            onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
            className="text-xs p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxAmount}
            onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
            className="text-xs p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* ACCIONES */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <Button variant="secondary" className="flex-1" icon={<RotateCcw size={16} />} onClick={clearFilters}>
          Limpiar
        </Button>
        <Button variant="primary" className="flex-2" onClick={onApply}>
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
};

export default TransactionFilters;