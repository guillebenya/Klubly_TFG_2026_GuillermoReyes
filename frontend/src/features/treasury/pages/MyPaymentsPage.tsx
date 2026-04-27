// src/features/treasury/pages/MyPaymentsPage.tsx
import React, { useEffect, useState } from "react";
import { Loader2, Wallet, CreditCard, Receipt, Filter } from "lucide-react";
import PageHeader from "../../../components/shared/PageHeader";
import Card from "../../../components/shared/Card";
import Modal from "../../../components/shared/Modal";
import Button from "../../../components/shared/Button";
import TransactionCard from "../components/TransactionCard";
import TransactionDetails from "../components/TransactionDetails";
import TransactionFilters from "../components/TransactionFilters";
import { treasuryService, type Transaction } from "../services/treasury.service";
import { authService } from "../../auth/services/auth.service";

const MyPaymentsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalPaid, setTotalPaid] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modales
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filtros Avanzados
  const [activeFilters, setActiveFilters] = useState({
    dateStart: "",
    dateEnd: "",
    types: [] as string[],
    methods: [] as string[],
    minAmount: "",
    maxAmount: "",
  });

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    if (currentUser?.id) {
      fetchData();
    }
  }, [currentUser?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transResp, totalResp] = await Promise.all([
        treasuryService.getByUserId(currentUser!.id),
        treasuryService.getUserTotalPaid(currentUser!.id)
      ]);
      setTransactions(transResp.data);
      setTotalPaid(totalResp.data);
    } catch (error) {
      console.error("Error cargando tus pagos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (t: Transaction) => {
    setSelectedTransaction(t);
    setIsViewOpen(true);
  };

  // --- LÓGICA DE FILTRADO COMPLETA ---
  const filteredTransactions = transactions.filter((t) => {
    // 1. Búsqueda por concepto
    const matchesSearch = t.concept.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Filtro por tipo (Ingreso/Gasto para el club)
    const matchesType = activeFilters.types.length === 0 || activeFilters.types.includes(t.type);
    
    // 3. Filtro por método de pago
    const matchesMethod = activeFilters.methods.length === 0 || activeFilters.methods.includes(t.paymentMethod);

    // 4. Filtro por rango de fechas
    const transDate = new Date(t.transactionDate).getTime();
    const matchesDateStart = !activeFilters.dateStart || transDate >= new Date(activeFilters.dateStart).getTime();
    const matchesDateEnd = !activeFilters.dateEnd || transDate <= new Date(activeFilters.dateEnd).getTime();

    // 5. Filtro por rango de importe
    const matchesMinAmount = !activeFilters.minAmount || t.amount >= parseFloat(activeFilters.minAmount);
    const matchesMaxAmount = !activeFilters.maxAmount || t.amount <= parseFloat(activeFilters.maxAmount);

    return (
      matchesSearch &&
      matchesType &&
      matchesMethod &&
      matchesDateStart &&
      matchesDateEnd &&
      matchesMinAmount &&
      matchesMaxAmount
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis Pagos"
        subtitle="Consulta tu historial de cuotas y aportaciones al club."
        onSearch={setSearchTerm}
        actions={
          <Button
            variant={isFilterOpen ? "primary" : "secondary"}
            icon={<Filter size={18} />}
            onClick={() => setIsFilterOpen(true)}
          >
            Filtros
          </Button>
        }
      />

      {/* RESUMEN PARA EL SOCIO */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5 flex items-center justify-between border-b-4 border-b-emerald-500 shadow-sm bg-gradient-to-br from-white to-emerald-50/30">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Total Aportado</p>
              <p className="text-2xl font-black text-emerald-600">
                {new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(totalPaid)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <Wallet size={24} />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between border-b-4 border-b-indigo-500 shadow-sm">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Movimientos Registrados</p>
              <p className="text-2xl font-black text-indigo-600">{transactions.length}</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Receipt size={24} />
            </div>
          </Card>
        </div>
      )}

      {/* LISTADO DE PAGOS */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mb-2" size={40} />
          <p className="italic font-medium">Cargando tu historial financiero...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map(t => (
              <TransactionCard 
                key={t.id} 
                transaction={t} 
                onView={handleView}
                isMemberView={true}
              />
            ))
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-100">
              <CreditCard size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500 italic">No se han encontrado pagos con los criterios seleccionados.</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL FILTROS */}
      <Modal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filtros de Búsqueda"
        size="sm"
      >
        <TransactionFilters
          filters={activeFilters}
          setFilters={setActiveFilters}
          onApply={() => setIsFilterOpen(false)}
        />
      </Modal>

      {/* MODAL DETALLES */}
      <Modal 
        isOpen={isViewOpen} 
        onClose={() => setIsViewOpen(false)} 
        title="Detalle del Pago" 
        size="lg"
      >
        {selectedTransaction && <TransactionDetails transaction={selectedTransaction} />}
      </Modal>
    </div>
  );
};

export default MyPaymentsPage;