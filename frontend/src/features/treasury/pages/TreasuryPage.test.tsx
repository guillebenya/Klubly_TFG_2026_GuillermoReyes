import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TreasuryPage from "./TreasuryPage";
import { treasuryService } from "../services/treasury.service";

//  Mockeamos el servicio de tesorería para no hacer llamadas reales al backend
vi.mock("../services/treasury.service", () => ({
  treasuryService: {
    getAll: vi.fn(),
    getDeletedHistory: vi.fn(),
    getGlobalSummary: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../../../components/shared/PageHeader", () => ({
  default: ({ title, subtitle, onSearch, actions }: any) => (
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <input placeholder="Buscar" onChange={(e) => onSearch(e.target.value)} />
      <div>{actions}</div>
    </div>
  ),
}));

vi.mock("../../../components/shared/Modal", () => ({
  default: ({ isOpen, title, children }: any) =>
    isOpen ? (
      <dialog open>
        <h2>{title}</h2>
        {children}
      </dialog>
    ) : null,
}));

vi.mock("../../../components/shared/Button", () => ({
  default: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

vi.mock("../../../components/shared/SummaryCard", () => ({
  default: ({ title, value }: any) => (
    <div>
      <span>{title}</span>
      <span>{value}</span>
    </div>
  ),
}));

vi.mock("../../../components/shared/ConfirmDialog", () => ({
  default: ({ isOpen, onConfirm, confirmLabel }: any) =>
    isOpen ? (
      <div>
        <button onClick={onConfirm}>{confirmLabel}</button>
      </div>
    ) : null,
}));

vi.mock("../../../components/shared/SuccessDialog", () => ({
  default: ({ isOpen, onClose, title }: any) =>
    isOpen ? (
      <div>
        <span>{title}</span>
        <button onClick={onClose}>Cerrar</button>
      </div>
    ) : null,
}));

vi.mock("../components/TransactionCard", () => ({
  default: ({ transaction, onView, onEdit, onDelete }: any) => (
    <div data-testid="transaction-card">
      <span>{transaction.concept}</span>
      <button onClick={() => onView(transaction)}>Ver</button>
      {onEdit && <button onClick={() => onEdit(transaction)}>Editar</button>}
      {onDelete && (
        <button onClick={() => onDelete(transaction.id)}>Eliminar</button>
      )}
    </div>
  ),
}));

vi.mock("../components/TransactionForm", () => ({
  default: ({ onSubmit, onCancel }: any) => (
    <div data-testid="transaction-form">
      <button onClick={() => onSubmit({ concept: "Test", amount: 100 })}>
        Guardar
      </button>
      <button onClick={onCancel}>Cancelar</button>
    </div>
  ),
}));

vi.mock("../components/TransactionDetails", () => ({
  default: () => <div data-testid="transaction-details">Detalles</div>,
}));

vi.mock("../components/TransactionFilters", () => ({
  default: ({ onApply }: any) => (
    <div data-testid="transaction-filters">
      <button onClick={onApply}>Aplicar filtros</button>
    </div>
  ),
}));

describe("TreasuryPage", () => {
  const mockTransactions = [
    {
      id: 1,
      concept: "Cuota Mensual Socio",
      amount: 50,
      type: "INCOME",
      paymentMethod: "TRANSFER",
      transactionDate: "2026-05-10T10:00:00",
      userFullName: "Juan Pérez",
      active: true,
    },
    {
      id: 2,
      concept: "Compra Material",
      amount: 120.5,
      type: "EXPENSE",
      paymentMethod: "CARD",
      transactionDate: "2026-05-09T10:00:00",
      userFullName: "Ana Gómez",
      active: true,
    },
  ];

  const mockSummary = {
    totalIncome: 1500,
    totalExpense: 500,
    balance: 1000,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Configuramos las respuestas por defecto del mock
    (treasuryService.getAll as any).mockResolvedValue({
      data: mockTransactions,
    });
    (treasuryService.getGlobalSummary as any).mockResolvedValue({
      data: mockSummary,
    });
    (treasuryService.getDeletedHistory as any).mockResolvedValue({ data: [] });
  });

  it("debe mostrar el estado de carga inicialmente y luego renderizar los datos", async () => {
    render(<TreasuryPage />);

    // Verificamos el estado inicial de carga
    expect(
      screen.getByText(/Sincronizando libros contables/i),
    ).toBeInTheDocument();

    // Esperamos a que los datos se carguen y se quiten los loaders
    await waitFor(() => {
      expect(
        screen.queryByText(/Sincronizando libros contables/i),
      ).not.toBeInTheDocument();
    });

    // Verificamos que se han llamado a los servicios correctos
    expect(treasuryService.getAll).toHaveBeenCalledTimes(1);
    expect(treasuryService.getGlobalSummary).toHaveBeenCalledTimes(1);

    // Verificamos que los conceptos de las transacciones aparecen en pantalla
    expect(screen.getByText("Cuota Mensual Socio")).toBeInTheDocument();
    expect(screen.getByText("Compra Material")).toBeInTheDocument();
  });

  it("debe renderizar las tarjetas de resumen (SummaryCards) correctamente", async () => {
    render(<TreasuryPage />);

    await waitFor(() => {
      expect(
        screen.queryByText(/Sincronizando libros contables/i),
      ).not.toBeInTheDocument();
    });

    // Verificamos que los textos estáticos de las tarjetas de resumen están
    expect(screen.getByText("Total Ingresos")).toBeInTheDocument();
    expect(screen.getByText("Total Gastos")).toBeInTheDocument();
    expect(screen.getByText("Balance Global")).toBeInTheDocument();
  });

  it("debe abrir el modal de nueva transacción al hacer clic en 'Añadir Transacción'", async () => {
    render(<TreasuryPage />);

    await waitFor(() => {
      expect(
        screen.queryByText(/Sincronizando libros contables/i),
      ).not.toBeInTheDocument();
    });

    // Buscamos el botón por su texto
    const addButton = screen.getByText("Añadir Transacción");
    fireEvent.click(addButton);

    // Verificamos que el modal se ha abierto buscando su título
    expect(screen.getByText("Nueva Transacción")).toBeInTheDocument();
  });

  it("debe cambiar al modo historial al hacer clic en 'Ver Bajas'", async () => {
    render(<TreasuryPage />);

    await waitFor(() => {
      expect(
        screen.queryByText(/Sincronizando libros contables/i),
      ).not.toBeInTheDocument();
    });

    // Limpiamos los mocks antes de interactuar para contar bien las llamadas
    vi.clearAllMocks();
    (treasuryService.getDeletedHistory as any).mockResolvedValue({ data: [] });
    (treasuryService.getGlobalSummary as any).mockResolvedValue({
      data: mockSummary,
    });

    // Activamos el modo historial
    const historyButton = screen.getByText("Ver Bajas");
    fireEvent.click(historyButton);

    // Esperamos a que el título de la página cambie
    await waitFor(() => {
      expect(screen.getByText("Historial Contable")).toBeInTheDocument();
    });

    // Verificamos que se ha llamado a la API del historial
    expect(treasuryService.getDeletedHistory).toHaveBeenCalledTimes(1);
    // En el modo historial no debería haber resumen ni botón de añadir
    expect(screen.queryByText("Añadir Transacción")).not.toBeInTheDocument();
  });
});
