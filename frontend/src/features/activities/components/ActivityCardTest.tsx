import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ActivityCard from "./ActivityCard";
import { registrationService } from "../services/registration.service";

// Mock del servicio de registro
vi.mock("../services/registration.service", () => ({
  registrationService: {
    registerSelf: vi.fn(),
    unregisterSelf: vi.fn(),
  },
}));

describe("ActivityCard", () => {
  const mockActivity = {
    id: 1,
    name: "Entrenamiento Senior",
    description: "Descripción de prueba",
    startDate: "2026-10-10T10:00:00",
    endDate: "2026-10-10T12:00:00",        
    location: "Pabellón Central",
    capacity: 20,
    registeredCount: 10,
    active: true,
    teamNames: ["Senior A"],
    teamIds: [5],                          
    userRegistered: false,
  };

  const defaultProps = {
    activity: mockActivity,
    onView: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onRefresh: vi.fn(),
    isMember: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe renderizar la información básica de la actividad", () => {
    render(<ActivityCard {...defaultProps} />);

    expect(screen.getByText("Entrenamiento Senior")).toBeInTheDocument();
    expect(screen.getByText("Pabellón Central")).toBeInTheDocument();
    expect(screen.getByText("10/20")).toBeInTheDocument();
    expect(screen.getByText("Senior A")).toBeInTheDocument();
  });

  it("debe llamar a onEdit cuando se pulsa el botón de editar", () => {
    render(<ActivityCard {...defaultProps} />);

    // Buscamos el botón por el icono o clase si no tiene texto
    // En este caso, el botón de editar tiene la clase !text-amber-600
    const editBtn = screen
      .getByRole("button", { name: "" })
      .parentElement?.querySelector(".text-amber-600");
    if (editBtn) fireEvent.click(editBtn);

    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockActivity);
  });

  describe("Lógica de Miembros (Inscripciones)", () => {
    it("debe mostrar el botón 'Apuntarse' si el usuario es miembro y no está inscrito", () => {
      render(<ActivityCard {...defaultProps} isMember={true} />);
      expect(screen.getByText("Apuntarse")).toBeInTheDocument();
    });

    it("debe llamar al servicio de registro al hacer clic en 'Apuntarse'", async () => {
      render(<ActivityCard {...defaultProps} isMember={true} />);

      const registerBtn = screen.getByText("Apuntarse");
      fireEvent.click(registerBtn);

      expect(registrationService.registerSelf).toHaveBeenCalledWith(
        mockActivity.id,
      );
      await waitFor(() => expect(defaultProps.onRefresh).toHaveBeenCalled());
    });

    it("debe mostrar el botón 'Desapuntarse' si ya está inscrito", () => {
      const registeredActivity = { ...mockActivity, userRegistered: true };
      render(
        <ActivityCard
          {...defaultProps}
          activity={registeredActivity}
          isMember={true}
        />,
      );

      expect(screen.getByText("Desapuntarse")).toBeInTheDocument();
    });

    it("debe mostrar el badge 'Lleno' si se ha alcanzado la capacidad", () => {
      const fullActivity = {
        ...mockActivity,
        registeredCount: 20,
        capacity: 20,
      };
      render(
        <ActivityCard
          {...defaultProps}
          activity={fullActivity}
          isMember={true}
        />,
      );

      expect(screen.getByText("Lleno")).toBeInTheDocument();
      expect(screen.queryByText("Apuntarse")).not.toBeInTheDocument();
    });
  });

  it("debe mostrar 'FINALIZADA' y aplicar estilos de escala de grises si la fecha es pasada", () => {
    const pastActivity = { ...mockActivity, startDate: "2020-01-01T10:00:00" };
    render(<ActivityCard {...defaultProps} activity={pastActivity} />);

    expect(screen.getByText("FINALIZADA")).toBeInTheDocument();
    const card = screen.getByText("Entrenamiento Senior").closest("div.flex");
    expect(card?.parentElement?.parentElement).toHaveClass("grayscale-[0.5]");
  });
});
