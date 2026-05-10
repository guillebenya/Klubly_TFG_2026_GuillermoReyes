import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ActivityPage from "./ActivityPage";
import { type Activity, activityService } from "../services/activity.service";
import { authService } from "../../auth/services/auth.service";
import type { AxiosResponse } from "axios";

// Mocks de servicios
vi.mock("../services/activity.service", () => ({
  activityService: {
    getAll: vi.fn(),
    getDeletedHistory: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../../auth/services/auth.service", () => ({
  authService: {
    getCurrentUser: vi.fn(),
  },
}));

describe("ActivityPage", () => {
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);
  const nextMonth = new Date();
  nextMonth.setMonth(now.getMonth() + 1);

  const mockActivities: Activity[] = [
    {
      id: 1,
      name: "Entrenamiento A",
      description: "Sesión de técnica individual", 
      location: "Pabellón 1",
      startDate: tomorrow.toISOString(),
      endDate: tomorrow.toISOString(), 
      capacity: 20,
      registeredCount: 5,
      active: true,
      teamIds: [1],
      teamNames: ["Senior Masculino"], 
      userRegistered: false, 
    },
    {
      id: 2,
      name: "Partido Completo",
      description: "Amistoso de pretemporada", 
      location: "Estadio Principal",
      startDate: nextMonth.toISOString(),
      endDate: nextMonth.toISOString(), 
      capacity: 10,
      registeredCount: 10,
      active: true,
      teamIds: [],
      teamNames: [], 
      userRegistered: true, 
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    const axiosResponse: AxiosResponse<Activity[]> = {
      data: mockActivities,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as any,
    };

    vi.mocked(activityService.getAll).mockResolvedValue(axiosResponse);
  });

  it("debe mostrar los indicadores de resumen correctamente", async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      roleName: "ADMIN",
    });
    render(<ActivityPage />);

    // Esperar a que cargue
    expect(
      await screen.findByText(/Actividades este mes/i),
    ).toBeInTheDocument();

    // Debería haber 1 actividad este mes (Entrenamiento A)
    const thisMonthCard = screen.getByText("1");
    expect(thisMonthCard).toBeInTheDocument();

    // Debería haber 1 actividad llena de 2 totales
    expect(screen.getByText(/1 de 2 llenas/i)).toBeInTheDocument();
  });

  it("un MEMBER no debe ver el botón de añadir ni el historial", async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      roleName: "MEMBER",
    });
    render(<ActivityPage />);

    await waitFor(() => expect(activityService.getAll).toHaveBeenCalled());

    expect(screen.queryByText(/Añadir Actividad/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Ver Bajas/i)).not.toBeInTheDocument();
  });

  it("debe filtrar por nombre de actividad", async () => {
    const user = userEvent.setup();
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      roleName: "ADMIN",
    });
    render(<ActivityPage />);

    const searchInput = await screen.findByPlaceholderText(/buscar/i);
    await user.type(searchInput, "Partido");

    expect(screen.getByText("Partido Completo")).toBeInTheDocument();
    expect(screen.queryByText("Entrenamiento A")).not.toBeInTheDocument();
  });

  it("debe ejecutar el flujo de borrado con éxito", async () => {
    const user = userEvent.setup();
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      roleName: "ADMIN",
    });
    vi.mocked(activityService.delete).mockResolvedValue({
      data: {},
      status: 200,
    } as any);

    render(<ActivityPage />);

    // Abrir confirmación (en la primera card que no sea pasada)
    const deleteButtons = await screen.findAllByRole("button", {
      name: /eliminar/i,
    });
    await user.click(deleteButtons[0]);

    // Localizar el diálogo usando la técnica que aprobó SonarQube
    const dialogs = screen.getAllByRole("dialog");
    const activeDialog = dialogs.at(-1) || dialogs[0];

    // Confirmar borrado dentro del modal
    const confirmBtn = within(activeDialog).getByRole("button", {
      name: /^Eliminar$/i,
    });
    await user.click(confirmBtn);

    // Verificar llamada y mensaje de éxito
    expect(activityService.delete).toHaveBeenCalledWith(1);
    expect(
      await screen.findByText(/La actividad ha sido enviada al historial/i),
    ).toBeInTheDocument();
  });

  it('debe mostrar el mensaje de "No hay actividades" cuando la lista está vacía', async () => {
    vi.mocked(activityService.getAll).mockResolvedValue({
      data: [],
      status: 200,
    } as any);
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      roleName: "ADMIN",
    });

    render(<ActivityPage />);

    expect(
      await screen.findByText(/No se han encontrado actividades/i),
    ).toBeInTheDocument();
  });
});
