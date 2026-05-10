import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CategoriesSection from "./CategoriesSection";
import { categoryService } from "../services/category.service";

vi.mock("../services/category.service", () => ({
  categoryService: {
    getAll: vi.fn(),
    getDeletedHistory: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("./CategoryCard", () => ({
  default: ({ category, onView, onEdit, onDelete }: any) => (
    <div data-testid={`card-${category.id}`}>
      <span>{category.name}</span>
      <button onClick={() => onView(category)}>Ver {category.id}</button>
      {onEdit && (
        <button onClick={() => onEdit(category)}>Editar {category.id}</button>
      )}
      {onDelete && (
        <button onClick={() => onDelete(category.id)}>
          Borrar {category.id}
        </button>
      )}
    </div>
  ),
}));

vi.mock("./CategoryDetails", () => ({
  default: ({ category }: any) => <div>Detalles MOCK de {category.name}</div>,
}));

describe("CategoriesSection", () => {
  const mockCategories = [
    { id: 1, name: "Ropa", description: "Textil", active: true, itemCount: 0 },
    {
      id: 2,
      name: "Material",
      description: "Bolas y conos",
      active: true,
      itemCount: 5,
    },
  ];

  const mockDeletedCategories = [
    {
      id: 3,
      name: "Antiguo",
      description: "Desc",
      active: false,
      itemCount: 0,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (categoryService.getAll as any).mockResolvedValue({ data: mockCategories });
    (categoryService.getDeletedHistory as any).mockResolvedValue({
      data: mockDeletedCategories,
    });
    (categoryService.create as any).mockResolvedValue({});
    (categoryService.update as any).mockResolvedValue({});
    (categoryService.delete as any).mockResolvedValue({});
  });

  it("debe cargar y mostrar las categorías iniciales", async () => {
    render(<CategoriesSection />);

    expect(document.querySelector(".animate-spin")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Ropa")).toBeInTheDocument();
      expect(screen.getByText("Material")).toBeInTheDocument();
    });

    expect(categoryService.getAll).toHaveBeenCalledTimes(1);
  });

  it("debe cambiar al modo historial y mostrar las bajas", async () => {
    render(<CategoriesSection />);
    await waitFor(() => expect(screen.getByText("Ropa")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Ver Bajas"));

    await waitFor(() => {
      expect(screen.getByText("Historial de Categorías")).toBeInTheDocument();
      expect(screen.getByText("Antiguo")).toBeInTheDocument();
    });

    expect(categoryService.getDeletedHistory).toHaveBeenCalledTimes(1);
  });

  it("debe abrir el modal de ver detalles", async () => {
    render(<CategoriesSection />);
    await waitFor(() => expect(screen.getByText("Ropa")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Ver 1"));

    expect(screen.getByText("Detalles de la Categoría")).toBeInTheDocument();
    expect(screen.getByText("Detalles MOCK de Ropa")).toBeInTheDocument();
  });

  describe("Flujo de Creación y Edición", () => {
    it("debe crear una nueva categoría", async () => {
      render(<CategoriesSection />);
      await waitFor(() => expect(screen.getByText("Ropa")).toBeInTheDocument());

      fireEvent.click(screen.getByText("Añadir Categoría"));
      expect(screen.getByText("Nueva Categoría")).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText(/Nombre/i), {
        target: { value: "Nueva Cat" },
      });
      fireEvent.change(screen.getByLabelText(/Descripción/i), {
        target: { value: "Desc nueva" },
      });

      fireEvent.click(screen.getByText("Guardar Cambios"));
      fireEvent.click(screen.getByText("Guardar"));

      await waitFor(() => {
        expect(categoryService.create).toHaveBeenCalledWith({
          name: "Nueva Cat",
          description: "Desc nueva",
          active: true,
        });
        expect(
          screen.getByText("¡Configuración guardada!"),
        ).toBeInTheDocument();
      });
    });

    it("debe editar una categoría existente", async () => {
      render(<CategoriesSection />);
      await waitFor(() => expect(screen.getByText("Ropa")).toBeInTheDocument());

      fireEvent.click(screen.getByText("Editar 1"));

      fireEvent.change(screen.getByLabelText(/Nombre/i), {
        target: { value: "Ropa Editada" },
      });

      fireEvent.click(screen.getByText("Guardar Cambios"));
      fireEvent.click(screen.getByText("Guardar"));

      await waitFor(() => {
        expect(categoryService.update).toHaveBeenCalledWith(
          1,
          expect.objectContaining({ name: "Ropa Editada" }),
        );
      });
    });

    it("NO debe permitir desactivar una categoría si tiene productos", async () => {
      const alertSpy = vi
        .spyOn(globalThis, "alert")
        .mockImplementation(() => {});

      render(<CategoriesSection />);
      await waitFor(() =>
        expect(screen.getByText("Material")).toBeInTheDocument(),
      );

      fireEvent.click(screen.getByText("Editar 2"));
      fireEvent.click(screen.getByRole("switch"));

      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "No puedes desactivar esta categoría porque todavía tiene 5 productos",
        ),
      );

      alertSpy.mockRestore();
    });
  });

  describe("Flujo de Eliminación", () => {
    it("debe eliminar una categoría y refrescar la lista al cerrar el modal de éxito", async () => {
      render(<CategoriesSection />);
      await waitFor(() => expect(screen.getByText("Ropa")).toBeInTheDocument());

      fireEvent.click(screen.getByText("Borrar 1"));
      expect(screen.getByText("¿Confirmar acción?")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Eliminar"));

      await waitFor(() => {
        expect(categoryService.delete).toHaveBeenCalledWith(1);
        expect(screen.getByText("Categoría eliminada")).toBeInTheDocument();
      });

      vi.clearAllMocks();
      (categoryService.getAll as any).mockResolvedValue({ data: [] });

      const lastButton = screen.getAllByRole("button").at(-1);
      fireEvent.click(lastButton!); // NOSONAR

      await waitFor(() => {
        expect(categoryService.getAll).toHaveBeenCalled();
      });
    });
  });
});
