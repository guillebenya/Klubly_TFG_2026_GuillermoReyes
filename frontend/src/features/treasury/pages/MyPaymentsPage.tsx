import React, { useEffect, useState } from "react";
import {
  Loader2,
  Wallet,
  CreditCard,
  Receipt,
  Filter,
  TrendingDown,
  TrendingUp,
  Scale,
  ArrowRightLeft,
} from "lucide-react";
import PageHeader from "../../../components/shared/PageHeader";
import Card from "../../../components/shared/Card";
import Modal from "../../../components/shared/Modal";
import Button from "../../../components/shared/Button";
import TransactionCard from "../components/TransactionCard";
import TransactionDetails from "../components/TransactionDetails";
import TransactionFilters from "../components/TransactionFilters";
import {
  treasuryService,
  type Transaction,
  TransactionType,
} from "../services/treasury.service";
import { authService } from "../../auth/services/auth.service";

const MyPaymentsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modales
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
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
      // Solo necesitamos getByUserId, ya que calcularemos los totales del array para que sean dinámicos
      const resp = await treasuryService.getByUserId(currentUser!.id);
      setTransactions(resp.data);
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

  // --- LÓGICA DE FILTRADO ---
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.concept
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType =
      activeFilters.types.length === 0 || activeFilters.types.includes(t.type);
    const matchesMethod =
      activeFilters.methods.length === 0 ||
      activeFilters.methods.includes(t.paymentMethod);
    const transDate = new Date(t.transactionDate).getTime();
    const matchesDateStart =
      !activeFilters.dateStart ||
      transDate >= new Date(activeFilters.dateStart).getTime();
    const matchesDateEnd =
      !activeFilters.dateEnd ||
      transDate <= new Date(activeFilters.dateEnd).getTime();
    const matchesMinAmount =
      !activeFilters.minAmount ||
      t.amount >= parseFloat(activeFilters.minAmount);
    const matchesMaxAmount =
      !activeFilters.maxAmount ||
      t.amount <= parseFloat(activeFilters.maxAmount);

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

  // --- CÁLCULOS DINÁMICOS ---
  // Calculamos sobre filteredTransactions para que las tarjetas reaccionen a los filtros
  const totalAportado = filteredTransactions
    .filter((t) => t.type === TransactionType.INCOME)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalRecibido = filteredTransactions
    .filter((t) => t.type === TransactionType.EXPENSE)
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalRecibido - totalAportado;
  const isPositiveBalance = balance >= 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

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
      <div className="flex items-center gap-1.5 px-1 opacity-80">
        <div className="h-1 w-1 rounded-full bg-indigo-400" />{" "}
        {/* Un punto decorativo en lugar de asterisco */}
        <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400">
          Resumen basado en los filtros actuales:
        </p>
      </div>

      {/* RESUMEN PARA EL SOCIO */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* CARD 1: APORTADO */}
          <Card className="p-5 flex items-center justify-between border-b-4 border-b-red-500 shadow-sm">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                Total Aportado
              </p>
              <p className="text-2xl font-black text-red-600">
                {formatCurrency(totalAportado)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-inner">
              <TrendingDown size={24} />
            </div>
          </Card>

          {/* CARD 2: RECIBIDO */}
          <Card className="p-5 flex items-center justify-between border-b-4 border-b-emerald-500 shadow-sm">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                Total Recibido
              </p>
              <p className="text-2xl font-black text-emerald-600">
                {formatCurrency(totalRecibido)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
              <TrendingUp size={24} />
            </div>
          </Card>

          {/* CARD 3: BALANCE*/}
          <Card
            className={`p-5 flex items-center justify-between border-b-4 shadow-sm transition-colors ${
              isPositiveBalance
                ? "border-b-emerald-500 bg-emerald-50/20"
                : "border-b-red-500 bg-red-50/20"
            }`}
          >
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                Balance Global
              </p>
              <p
                className={`text-2xl font-black ${isPositiveBalance ? "text-emerald-600" : "text-red-600"}`}
              >
                {formatCurrency(balance)}
              </p>
            </div>
            <div
              className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner ${
                isPositiveBalance
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              <Scale size={24} />
            </div>
          </Card>

          {/* CARD 4: MOVIMIENTOS */}
          <Card className="p-5 flex items-center justify-between border-b-4 border-b-indigo-500 shadow-sm">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                Movimientos
              </p>
              <p className="text-2xl font-black text-indigo-600">
                {filteredTransactions.length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ArrowRightLeft size={24} />
            </div>
          </Card>
        </div>
      )}

      {/* LISTADO DE PAGOS */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mb-2" size={40} />
          <p className="italic font-medium">
            Cargando tu historial financiero...
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((t) => (
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
              <p className="text-gray-500 italic">
                No se han encontrado pagos con los criterios seleccionados.
              </p>
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
        {selectedTransaction && (
          <TransactionDetails transaction={selectedTransaction} />
        )}
      </Modal>
    </div>
  );
};

export default MyPaymentsPage;
