import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import InventoryPage from "./InventoryPage";
import { itemService, type Item } from "../services/item.service";
import {
  categoryService,
  type Category,
} from "../../configuration/services/category.service";
import { authService } from "../../auth/services/auth.service";

// Mocks de los servicios
vi.mock("../services/item.service", () => ({
  itemService: {
    getAll: vi.fn(),
    getDeletedHistory: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../../configuration/services/category.service", () => ({
  categoryService: {
    getAll: vi.fn(),
  },
}));

vi.mock("../../auth/services/auth.service", () => ({
  authService: {
    getCurrentUser: vi.fn(),
  },
}));

describe("InventoryPage Integration Tests", () => {
  const mockItems: Item[] = [
    {
      id: 1,
      name: "Balones Nike",
      description: "Balones de reglamento para competición", // Añadido
      categoryName: "Material",
      categoryId: 1,
      stockQuantity: 2,
      minStock: 5,
      location: "Almacén A",
      active: true,
    },
    {
      id: 2,
      name: "Conos Entrenamiento",
      description: "Conos de 30cm color naranja", // Añadido
      categoryName: "Material",
      categoryId: 1,
      stockQuantity: 20,
      minStock: 10,
      location: "Almacén B",
      active: true,
    },
  ];

  const mockCategories: Category[] = [
    {
      id: 1,
      name: "Material",
      description: "Material deportivo general", // Añadido
      active: true, // Añadido
      itemCount: 2, // Añadido
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock de respuestas Axios completas
    const itemsResponse = {
      data: mockItems,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as any,
    };

    const categoriesResponse = {
      data: mockCategories,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as any,
    };

    vi.mocked(itemService.getAll).mockResolvedValue(itemsResponse);
    vi.mocked(categoryService.getAll).mockResolvedValue(categoriesResponse);
  });

  it("debe calcular correctamente las Alertas de Stock en las tarjetas resumen", async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      roleName: "ADMIN",
    });
    render(<InventoryPage />);

    // Esperamos a que la página cargue los datos
    expect(await screen.findByText("Balones Nike")).toBeInTheDocument();

    // Total
    const totalLabel = screen.getByText(/Total Artículos/i);
    const totalCard = totalLabel.closest("div");

    if (totalCard) {
      expect(within(totalCard).getByText("2")).toBeInTheDocument();
    }

    // Alertas de Stock
    const alertLabel = screen.getByText(/Alertas de Stock/i);
    const alertCard = alertLabel.closest("div");

    if (alertCard) {
      expect(within(alertCard).getByText("1")).toBeInTheDocument();
    }
  });

  it("un ADMIN debe ver las acciones de gestión pero un usuario normal no", async () => {
    // Caso ADMIN
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      roleName: "ADMIN",
    });
    const { rerender } = render(<InventoryPage />);
    expect(await screen.findByText(/Añadir Ítem/i)).toBeInTheDocument();

    // Caso USER
    vi.mocked(authService.getCurrentUser).mockReturnValue({ roleName: "USER" });
    rerender(<InventoryPage />);
    expect(screen.queryByText(/Añadir Ítem/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Ver Bajas/i)).not.toBeInTheDocument();
  });

  it("debe filtrar la lista de artículos por el término de búsqueda", async () => {
    const user = userEvent.setup();
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      roleName: "ADMIN",
    });
    render(<InventoryPage />);

    const searchInput = await screen.findByPlaceholderText(/buscar/i);
    await user.type(searchInput, "Conos");

    expect(screen.getByText("Conos Entrenamiento")).toBeInTheDocument();
    expect(screen.queryByText("Balones Nike")).not.toBeInTheDocument();
  });

  it("debe abrir el flujo de borrado y mostrar el diálogo de éxito", async () => {
    const user = userEvent.setup();
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      roleName: "ADMIN",
    });
    vi.mocked(itemService.delete).mockResolvedValue({ status: 200 } as any);

    render(<InventoryPage />);

    // 1. Click en el primer botón de eliminar que encuentre en las tarjetas
    const deleteBtns = await screen.findAllByRole("button", {
      name: /eliminar/i,
    });
    await user.click(deleteBtns[0]);

    // 2. Verificar diálogo de confirmación (técnica SonarQube)
    const dialogs = screen.getAllByRole("dialog");
    const activeDialog = dialogs.at(-1) || dialogs[0];

    expect(
      within(activeDialog).getByText(
        /¿Estás seguro de dar de baja este artículo?/i,
      ),
    ).toBeInTheDocument();

    // 3. Confirmar acción
    const confirmBtn = within(activeDialog).getByRole("button", {
      name: /^Eliminar$/i,
    });
    await user.click(confirmBtn);

    // 4. Verificar éxito
    expect(itemService.delete).toHaveBeenCalledWith(1);
    expect(await screen.findByText(/¡Eliminado!/i)).toBeInTheDocument();
  });
});
