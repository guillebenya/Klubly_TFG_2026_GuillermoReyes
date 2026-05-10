import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useNavigate } from "react-router-dom";
import DashboardPage from "./DashboardPage";

// MOCKS DE LIBRERÍAS
vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

// MOCKS DE SERVICIOS
vi.mock("../../auth/services/auth.service", () => ({
  authService: {
    getCurrentUser: vi.fn(),
  },
}));

vi.mock("../../identity/services/user.service", () => ({
  userService: { getAll: vi.fn() },
}));

vi.mock("../../treasury/services/treasury.service", () => ({
  treasuryService: {
    getGlobalSummary: vi.fn(),
    getByUserId: vi.fn(),
  },
  TransactionType: {
    INCOME: "INCOME",
    EXPENSE: "EXPENSE",
  },
}));

vi.mock("../../activities/services/activity.service", () => ({
  activityService: { getAll: vi.fn() },
}));

vi.mock("../../inventory/services/item.service", () => ({
  itemService: { getAll: vi.fn() },
}));

// Importamos los mocks para poder cambiar su valor en cada test
import { authService } from "../../auth/services/auth.service";
import { userService } from "../../identity/services/user.service";
import { treasuryService } from "../../treasury/services/treasury.service";
import { activityService } from "../../activities/services/activity.service";
import { itemService } from "../../inventory/services/item.service";

describe("DashboardPage", () => {
  const navigateMock = vi.fn();

  // Datos falsos para que las promesas se resuelvan
  const mockUsers = [
    { id: 1, roleName: "MEMBER" },
    { id: 2, roleName: "STAFF" },
  ];
  const mockActivities = [{ id: 1, startDate: "2030-01-01T10:00:00" }]; // Fecha futura para que cuente
  const mockItems = [{ id: 1, stockQuantity: 2, minStock: 5 }]; // Low stock!
  const mockSummary = { balance: 5000.5 };
  const mockTransactions = [
    { amount: 100, type: "EXPENSE" }, // Recibido
    { amount: 50, type: "INCOME" }, // Aportado (Balance personal = 50)
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(navigateMock);

    // Respuestas por defecto de las APIs
    (userService.getAll as any).mockResolvedValue({ data: mockUsers });
    (activityService.getAll as any).mockResolvedValue({ data: mockActivities });
    (treasuryService.getGlobalSummary as any).mockResolvedValue({
      data: mockSummary,
    });
    (treasuryService.getByUserId as any).mockResolvedValue({
      data: mockTransactions,
    });
    (itemService.getAll as any).mockResolvedValue({ data: mockItems });
  });

  it("debe renderizar el dashboard para un ADMIN con todas sus tarjetas y accesos", async () => {
    (authService.getCurrentUser as any).mockReturnValue({
      id: 1,
      firstName: "Admin",
      roleName: "ADMIN",
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("¡Hola, Admin! 👋")).toBeInTheDocument();
      expect(screen.getByText("Usuarios Totales")).toBeInTheDocument();
      expect(screen.getByText("Balance Global")).toBeInTheDocument();
      expect(screen.getByText("Estado de Caja")).toBeInTheDocument();
      expect(screen.getByText("Configuración")).toBeInTheDocument();
    });
  });

  it("debe renderizar el dashboard para un STAFF con sus métricas específicas", async () => {
    // Simulamos que el usuario logueado es STAFF
    (authService.getCurrentUser as any).mockReturnValue({
      id: 2,
      firstName: "Entrenador",
      roleName: "STAFF",
      teamIds: [1],
    });

    render(<DashboardPage />);

    await waitFor(() => {
      // Tarjetas de Staff
      expect(screen.getByText("Usuarios en mis Equipos")).toBeInTheDocument();
      expect(screen.getByText("Alertas de Stock")).toBeInTheDocument();

      // Accesos de Staff
      expect(screen.getByText("Ver Usuarios")).toBeInTheDocument();
      expect(screen.queryByText("Estado de Caja")).not.toBeInTheDocument(); // Staff no ve caja
    });
  });

  it("debe renderizar el dashboard para un MEMBER y calcular su balance personal", async () => {
    // Simulamos que el usuario logueado es MEMBER
    (authService.getCurrentUser as any).mockReturnValue({
      id: 3,
      firstName: "Jugador",
      roleName: "MEMBER",
    });

    render(<DashboardPage />);

    await waitFor(() => {
      // Tarjetas de Member
      expect(screen.getByText("Mi Balance Personal")).toBeInTheDocument();
      // El cálculo de nuestro mock es: 100 (Expense) - 50 (Income) = 50€
      expect(screen.getByText(/50,00/)).toBeInTheDocument();

      // Accesos de Member
      expect(screen.getByText("Mis Pagos")).toBeInTheDocument();
      expect(screen.getByText("Mi Perfil")).toBeInTheDocument();
      expect(screen.queryByText("Usuarios Totales")).not.toBeInTheDocument(); // Member no ve esto
    });
  });

  it("debe navegar a la ruta correcta al hacer clic en un acceso rápido", async () => {
    (authService.getCurrentUser as any).mockReturnValue({
      id: 1,
      firstName: "Admin",
      roleName: "ADMIN",
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Gestión de Usuarios")).toBeInTheDocument();
    });

    // Simulamos clic en el acceso rápido
    fireEvent.click(screen.getByText("Gestión de Usuarios"));

    // Verificamos que se llamó a react-router-dom con la ruta correcta
    expect(navigateMock).toHaveBeenCalledWith("/usuarios");
  });
});
