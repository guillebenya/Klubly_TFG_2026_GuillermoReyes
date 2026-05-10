import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TransactionForm from "./TransactionForm";
import { userService } from "../../identity/services/user.service";
import { TransactionType, PaymentMethod } from "../services/treasury.service";

// Mockeamos el servicio de usuarios que usa el useEffect
vi.mock("../../identity/services/user.service", () => ({
  userService: {
    getAll: vi.fn(),
  },
}));

describe("TransactionForm", () => {
  const mockUsers = [
    { id: 1, firstName: "Juan", lastName: "Pérez", username: "jperez" },
    { id: 2, firstName: "Ana", lastName: "García", username: "agarcia" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.getAll).mockResolvedValue({
      data: mockUsers,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as any,
    });
  });

  it("debe cargar y mostrar la lista de usuarios en el select", async () => {
    render(<TransactionForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    // Esperamos a que el useEffect termine y cargue los usuarios
    await waitFor(() => {
      expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
      expect(screen.getByText(/Ana García/i)).toBeInTheDocument();
    });
  });

  it("debe llamar a onSubmit con los datos formateados correctamente", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<TransactionForm onSubmit={handleSubmit} onCancel={vi.fn()} />);

    // Rellenamos Concepto
    const conceptInput = screen.getByPlaceholderText(
      /Ej: Pago Cuota Mensual Mayo/i,
    );
    await user.type(conceptInput, "Test Concepto");

    // Rellenamos Importe (valor string en el input, será float en el submit)
    const amountInput = screen.getByPlaceholderText("0.00");
    await user.type(amountInput, "150.50");

    // Seleccionamos un usuario
    const userSelect = screen.getByLabelText(/Socio \/ Usuario/i);
    await user.selectOptions(userSelect, "1");

    // Seleccionamos tipo GASTO
    const typeSelect = screen.getByLabelText(/Tipo/i);
    await user.selectOptions(typeSelect, TransactionType.EXPENSE);

    // Click en enviar
    const submitBtn = screen.getByRole("button", {
      name: /Registrar Movimiento/i,
    });
    await user.click(submitBtn);

    // Verificamos que los datos se transformaron bien
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        concept: "Test Concepto",
        amount: 150.5, // Verificamos parseFloat
        userId: 1, // Verificamos parseInt
        type: TransactionType.EXPENSE,
        active: true,
      }),
    );
  });

  it("debe cargar los datos iniciales correctamente en modo edición", async () => {
    const initialData = {
      id: 50,
      amount: 99.99,
      concept: "Gasto Inicial",
      transactionDate: "2025-05-10T10:00:00.000Z",
      type: TransactionType.EXPENSE,
      paymentMethod: PaymentMethod.CARD,
      userId: 2,
      active: false,
    };

    render(
      <TransactionForm
        initialData={initialData}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    // Verificamos que los inputs tengan los valores de initialData
    expect(screen.getByDisplayValue("Gasto Inicial")).toBeInTheDocument();
    expect(screen.getByDisplayValue("99.99")).toBeInTheDocument();

    // El select de usuario debería tener seleccionado el ID 2
    await waitFor(() => {
      const userSelect = screen.getByLabelText(
        /Socio \/ Usuario/i,
      ) as HTMLSelectElement;
      expect(userSelect.value).toBe("2");
    });

    // El toggle de active debería decir "Transacción Inactiva"
    expect(screen.getByText(/Transacción Inactiva/i)).toBeInTheDocument();
  });

  it("debe llamar a onCancel al pulsar el botón cancelar", async () => {
    const handleCancel = vi.fn();
    render(<TransactionForm onSubmit={vi.fn()} onCancel={handleCancel} />);

    const cancelBtn = screen.getByRole("button", { name: /Cancelar/i });
    fireEvent.click(cancelBtn);

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it("debe cambiar el estado de activo al hacer click en el toggle", async () => {
    render(<TransactionForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    const toggle = screen.getByText(/Transacción Activa/i);
    fireEvent.click(toggle);

    expect(screen.getByText(/Transacción Inactiva/i)).toBeInTheDocument();
  });
});
