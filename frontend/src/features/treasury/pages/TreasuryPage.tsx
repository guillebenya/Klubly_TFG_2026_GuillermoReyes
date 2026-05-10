import { useEffect, useState } from "react";
import {
  Plus,
  Filter,
  Loader2,
  History,
  ArrowLeft,
  Landmark,
  TrendingUp,
  TrendingDown,
  Scale,
} from "lucide-react";
import PageHeader from "../../../components/shared/PageHeader";
import Button from "../../../components/shared/Button";
import Modal from "../../../components/shared/Modal";
import TransactionCard from "../components/TransactionCard";
import TransactionForm from "../components/TransactionForm";
import TransactionDetails from "../components/TransactionDetails";
import TransactionFilters from "../components/TransactionFilters";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import SuccessDialog from "../../../components/shared/SuccessDialog";
import SummaryCard from "../../../components/shared/SummaryCard";
import {
  treasuryService,
  type Transaction,
  type TreasurySummary,
} from "../services/treasury.service";

const TreasuryPage = () => {
  // --- ESTADOS DE DATOS ---
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TreasurySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isHistoryMode, setIsHistoryMode] = useState(false);

  // --- ESTADOS PARA MODALES ---
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // --- FILTROS AVANZADOS ---
  const [activeFilters, setActiveFilters] = useState({
    dateStart: "",
    dateEnd: "",
    types: [] as string[],
    methods: [] as string[],
    minAmount: "",
    maxAmount: "",
  });

  // --- DIÁLOGOS DE SISTEMA ---
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    type: "save" | "delete";
    data?: any;
  }>({ isOpen: false, type: "save" });

  const [successConfig, setSuccessConfig] = useState({
    isOpen: false,
    title: "",
    desc: "",
  });

  // --- CARGA DE DATOS ---
  useEffect(() => {
    fetchData();
  }, [isHistoryMode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transResp, summaryResp] = await Promise.all([
        isHistoryMode
          ? treasuryService.getDeletedHistory()
          : treasuryService.getAll(),
        treasuryService.getGlobalSummary(),
      ]);
      setTransactions(transResp.data);
      setSummary(summaryResp.data);
    } catch (error) {
      console.error("Error cargando tesorería:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleView = (t: Transaction) => {
    setSelectedTransaction(t);
    setIsViewOpen(true);
  };

  const handleEdit = (t: Transaction) => {
    setSelectedTransaction(t);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedTransaction(null);
    setIsFormOpen(true);
  };

  const handleDeleteTrigger = (id: number) =>
    setConfirmConfig({ isOpen: true, type: "delete", data: id });

  const handleSaveTrigger = (data: any) =>
    setConfirmConfig({ isOpen: true, type: "save", data });

  const executeAction = async () => {
    try {
      setFormLoading(true);

      if (confirmConfig.type === "delete") {
        await treasuryService.delete(confirmConfig.data);
        setSuccessConfig({
          isOpen: true,
          title: "Movimiento Anulado",
          desc: "La transacción ha sido enviada al historial de bajas.",
        });
      } else {
        const transactionData = confirmConfig.data;

        if (transactionData.id) {
          // Si tiene ID, es una EDICIÓN
          await treasuryService.update(transactionData.id, transactionData);
          setSuccessConfig({
            isOpen: true,
            title: "¡Actualizado!",
            desc: "Los cambios se han guardado correctamente.",
          });
        } else {
          // Si NO tiene ID, es una CREACIÓN
          await treasuryService.create(transactionData);
          setSuccessConfig({
            isOpen: true,
            title: "¡Registrado!",
            desc: "El movimiento contable se ha guardado correctamente.",
          });
        }
      }
      setConfirmConfig({ ...confirmConfig, isOpen: false });
    } catch (error) {
      console.error("Error en la operación:", error);
      alert("Error al procesar la transacción");
    } finally {
      setFormLoading(false);
    }
  };

  // --- LÓGICA DE FILTRADO ---
  const filteredTransactions = transactions.filter((t) => {
    const searchStr = `${t.concept} ${t.userFullName || ""}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchTerm.toLowerCase());

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

  // Determinar color dinámico para el balance global
  const getBalanceVariant = () => {
    if (!summary) return "indigo";
    if (summary.balance > 0) return "emerald";
    if (summary.balance < 0) return "rose";
    return "gray";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          isHistoryMode ? "Historial Contable" : "Gestión de Transacciones"
        }
        subtitle={
          isHistoryMode
            ? "Consulta de movimientos eliminados del sistema."
            : "Control total de ingresos y gastos del club."
        }
        onSearch={setSearchTerm}
        actions={
          <>
            {isHistoryMode ? (
              <Button
                variant="secondary"
                icon={<ArrowLeft size={18} />}
                onClick={() => setIsHistoryMode(false)}
              >
                Volver
              </Button>
            ) : (
              <>
                <Button
                  variant={isFilterOpen ? "primary" : "secondary"}
                  icon={<Filter size={18} />}
                  onClick={() => setIsFilterOpen(true)}
                >
                  Filtros
                </Button>
                <Button
                  variant="ghost"
                  icon={<History size={18} />}
                  className="!text-indigo-600 hover:!bg-indigo-50"
                  onClick={() => setIsHistoryMode(true)}
                >
                  Ver Bajas
                </Button>
                <Button
                  variant="add"
                  icon={<Plus size={18} />}
                  onClick={handleAddNew}
                >
                  Añadir Transacción
                </Button>
              </>
            )}
          </>
        }
      />

      {/* TARJETAS DE RESUMEN*/}
      {!isHistoryMode && summary && (
        <>
          {/* Nota informativa */}
          <div className="flex items-center gap-1.5 px-1 mb-2 opacity-80">
            <div className="h-1 w-1 rounded-full bg-indigo-400" />
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 italic">
              Nota: Las tarjetas resumen muestran totales globales y no se ven
              afectados por los filtros de búsqueda.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard
              title="Total Ingresos"
              value={new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: "EUR",
              }).format(summary.totalIncome)}
              icon={<TrendingUp size={20} />}
              variant="emerald"
            />
            <SummaryCard
              title="Total Gastos"
              value={new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: "EUR",
              }).format(summary.totalExpense)}
              icon={<TrendingDown size={20} />}
              variant="rose"
            />
            <SummaryCard
              title="Balance Global"
              value={new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: "EUR",
              }).format(summary.balance)}
              icon={<Scale size={20} />}
              variant={getBalanceVariant()}
            />
          </div>
        </>
      )}

      {/* LISTADO DE MOVIMIENTOS */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mb-2" size={40} />
          <p className="italic font-medium">
            Sincronizando libros contables...
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
                onEdit={isHistoryMode ? undefined : handleEdit}
                onDelete={isHistoryMode ? undefined : handleDeleteTrigger}
              />
            ))
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-100">
              <Landmark size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500 italic">
                No hay movimientos que coincidan con la búsqueda.
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODALES */}
      <Modal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filtros Financieros"
        size="sm"
      >
        <TransactionFilters
          filters={activeFilters}
          setFilters={setActiveFilters}
          onApply={() => setIsFilterOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Detalle de Transacción"
        size="lg"
      >
        {selectedTransaction && (
          <TransactionDetails transaction={selectedTransaction} />
        )}
      </Modal>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedTransaction ? "Editar Movimiento" : "Nueva Transacción"}
      >
        <TransactionForm
          initialData={selectedTransaction}
          onSubmit={handleSaveTrigger}
          onCancel={() => setIsFormOpen(false)}
          loading={formLoading}
        />
      </Modal>

      {/* DIÁLOGOS DE CONFIRMACIÓN Y ÉXITO */}
      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={executeAction}
        title="¿Confirmar operación?"
        description={
          confirmConfig.type === "delete"
            ? "¿Estás seguro de que deseas anular esta transacción? Podrás consultarla en el historial de bajas."
            : "¿Deseas registrar este movimiento en los libros contables del club?"
        }
        confirmLabel={
          confirmConfig.type === "delete"
            ? "Anular Movimiento"
            : "Confirmar Registro"
        }
        type={confirmConfig.type === "delete" ? "danger" : "warning"}
        isLoading={formLoading}
      />

      <SuccessDialog
        isOpen={successConfig.isOpen}
        onClose={() => {
          setSuccessConfig({ ...successConfig, isOpen: false });
          setIsFormOpen(false);
          fetchData();
        }}
        title={successConfig.title}
        description={successConfig.desc}
      />
    </div>
  );
};

export default TreasuryPage;
