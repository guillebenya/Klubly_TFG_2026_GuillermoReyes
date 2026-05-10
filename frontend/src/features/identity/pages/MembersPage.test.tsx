import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MembersPage from "./MembersPage";
import { userService } from "../services/user.service";
import { teamService } from "../services/team.service";
import { authService } from "../../auth/services/auth.service";

// Mocks de los servicios
vi.mock("../services/user.service", () => ({
  userService: {
    getAll: vi.fn(),
    getDeletedHistory: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../services/team.service", () => ({
  teamService: {
    getAll: vi.fn(),
  },
}));

vi.mock("../../auth/services/auth.service", () => ({
  authService: {
    getCurrentUser: vi.fn(),
  },
}));

describe("MembersPage", () => {
  const mockMembers = [
    {
      id: 1,
      firstName: "Guille",
      lastName: "Admin",
      username: "admin",
      roleName: "ADMIN",
      active: true,
      isPending: false,
      affiliations: [],
    },
    {
      id: 2,
      firstName: "Juan",
      lastName: "Socio",
      username: "juan",
      roleName: "USER",
      active: true,
      isPending: false,
      affiliations: [{ teamId: 1 }],
    },
    {
      id: 3,
      firstName: "Ana",
      lastName: "Pendiente",
      username: "ana",
      roleName: "USER",
      active: false,
      isPending: true,
      affiliations: [],
    },
  ];

  const mockTeams = [{ id: 1, name: "Equipo A" }];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock de usuarios completo
    vi.mocked(userService.getAll).mockResolvedValue({
      data: mockMembers,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as any,
    });

    // Mock de equipos completo
    vi.mocked(teamService.getAll).mockResolvedValue({
      data: mockTeams,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as any,
    });
  });

  it("debe mostrar el esqueleto de carga y luego la lista de miembros", async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      roleName: "ADMIN",
    });

    render(<MembersPage />);

    // Verificamos estado de carga
    expect(
      screen.getByText(/Sincronizando base de datos/i),
    ).toBeInTheDocument();

    // Verificamos que se cargan los miembros
    expect(await screen.findByText("Guille Admin")).toBeInTheDocument();
    expect(screen.getByText("Juan Socio")).toBeInTheDocument();
  });

  it("un ADMIN debe ver todos los miembros y el botón de añadir", async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      roleName: "ADMIN",
    });

    render(<MembersPage />);

    expect(await screen.findByText("Añadir usuario")).toBeInTheDocument();
    expect(screen.getByText("Total Usuarios")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument(); // Total de mockMembers
  });

  it("un STAFF solo debe ver miembros de sus equipos", async () => {
    // Simulamos un Staff que solo está en el equipo con ID: 1
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      roleName: "STAFF",
      teamIds: [1],
    });

    render(<MembersPage />);

    // Debería ver a Juan (que está en el equipo 1) pero no a Guille (Admin) ni a Ana (Pendiente)
    await waitFor(() => {
      expect(screen.getByText("Juan Socio")).toBeInTheDocument();
      expect(screen.queryByText("Guille Admin")).not.toBeInTheDocument();
      expect(screen.queryByText("Ana Pendiente")).not.toBeInTheDocument();
    });
  });

  it("debe filtrar la lista cuando el usuario escribe en el buscador", async () => {
    const user = userEvent.setup();
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      roleName: "ADMIN",
    });

    render(<MembersPage />);

    const searchInput = await screen.findByPlaceholderText(/buscar/i);
    await user.type(searchInput, "Juan");

    expect(screen.getByText("Juan Socio")).toBeInTheDocument();
    expect(screen.queryByText("Guille Admin")).not.toBeInTheDocument();
  });

  it("debe abrir el flujo de borrado y mostrar éxito tras confirmar", async () => {
    const user = userEvent.setup();
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      roleName: "ADMIN",
    });
    vi.mocked(userService.delete).mockResolvedValue({
      data: {},
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as any,
    });

    render(<MembersPage />);

    // Click en el botón de la lista
    const deleteBtns = await screen.findAllByRole("button", {
      name: /eliminar/i,
    });
    await user.click(deleteBtns[0]);

    // Verificar que se abre el diálogo
    expect(screen.getByText(/¿Confirmar operación\?/i)).toBeInTheDocument();

    // Buscar el Modal por su rol de diálogo
    const dialogs = screen.getAllByRole("dialog");

    // Normalmente, si hay un modal abierto, será el último del array o el único
    const activeDialog = dialogs.at(-1) || dialogs[0];

    // Buscamos el botón "Eliminar" solo dentro de ese modal
    const confirmBtn = within(activeDialog).getByRole("button", {
      name: /^Eliminar$/i,
    });
    await user.click(confirmBtn);

    // Verificar éxito
    expect(userService.delete).toHaveBeenCalled();
    expect(await screen.findByText(/¡Eliminado!/i)).toBeInTheDocument();
  });
});
