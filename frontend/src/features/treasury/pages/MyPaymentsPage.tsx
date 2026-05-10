import { useEffect, useState } from "react";
import {
  Loader2,
  CreditCard,
  Filter,
  TrendingDown,
  TrendingUp,
  Scale,
  ArrowRightLeft,
} from "lucide-react";
import PageHeader from "../../../components/shared/PageHeader";
import Modal from "../../../components/shared/Modal";
import Button from "../../../components/shared/Button";
import SummaryCard from "../../../components/shared/SummaryCard"; // Usamos el componente compartido
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
      t.amount >= Number.parseFloat(activeFilters.minAmount);
    const matchesMaxAmount =
      !activeFilters.maxAmount ||
      t.amount <= Number.parseFloat(activeFilters.maxAmount);

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

  // --- CÁLCULOS GLOBALES (Sin filtros, para mantener coherencia) ---
  const totalAportado = transactions
    .filter((t) => t.type === TransactionType.INCOME) // Income para el club = Aportado por el socio
    .reduce((acc, t) => acc + t.amount, 0);

  const totalRecibido = transactions
    .filter((t) => t.type === TransactionType.EXPENSE) // Expense para el club = Recibido por el socio
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalRecibido - totalAportado;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getBalanceVariant = () => {
    if (balance > 0) return "emerald";
    if (balance < 0) return "rose";
    return "gray";
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

      {/* RESUMEN PARA EL SOCIO */}
      {!loading && (
        <>
          {/* Nota informativa */}
          <div className="flex items-center gap-1.5 px-1 mb-2 opacity-80">
            <div className="h-1 w-1 rounded-full bg-indigo-400" />
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 italic">
              Nota: Las tarjetas resumen muestran totales de tus transacciones y no se ven
              afectados por los filtros de búsqueda.
            </p>
          </div>

          {/* Grid de tarjetas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard
              title="Total Aportado"
              value={formatCurrency(totalAportado)}
              icon={<TrendingDown size={20} />}
              variant="rose"
            />
            <SummaryCard
              title="Total Recibido"
              value={formatCurrency(totalRecibido)}
              icon={<TrendingUp size={20} />}
              variant="emerald"
            />
            <SummaryCard
              title="Balance Global"
              value={formatCurrency(balance)}
              icon={<Scale size={20} />}
              variant={getBalanceVariant()}
            />
            <SummaryCard
              title="Movimientos"
              value={transactions.length}
              icon={<ArrowRightLeft size={20} />}
              variant="indigo"
            />
          </div>
        </>
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
