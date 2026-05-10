import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProfilePage from "./ProfilePage";
import { authService } from "../../auth/services/auth.service";
import { userService } from "../services/user.service";

// MOCKS DE SERVICIOS
vi.mock("../../auth/services/auth.service", () => ({
  authService: {
    getCurrentUser: vi.fn(),
  },
}));

vi.mock("../services/user.service", () => ({
  userService: {
    getByUsername: vi.fn(),
    update: vi.fn(),
    changePassword: vi.fn(),
  },
}));

// MOCKS DE COMPONENTES HIJOS
// Simulamos las tarjetas para poder disparar sus eventos fácilmente sin lidiar con su HTML interno
vi.mock("../components/ProfileAvatarCard", () => ({
  default: ({ onEditAvatar }: any) => (
    <button onClick={onEditAvatar}>MOCK_EDITAR_AVATAR</button>
  ),
}));

vi.mock("../components/ProfilePersonalInfoCard", () => ({
  default: ({ onEditPersonal }: any) => (
    <button onClick={onEditPersonal}>MOCK_EDITAR_PERSONAL</button>
  ),
}));

vi.mock("../components/ChangePasswordCard", () => ({
  default: ({ onConfirm }: any) => (
    <button onClick={() => onConfirm({ oldPass: "123", newPass: "321" })}>
      MOCK_CAMBIAR_PASS
    </button>
  ),
}));

// Tarjetas puramente visuales que no necesitamos interactuar
vi.mock("../components/ProfileAccountInfoCard", () => ({
  default: () => <div />,
}));
vi.mock("../components/MyTeamsTableCard", () => ({ default: () => <div /> }));

describe("ProfilePage", () => {
  const mockUser = { username: "guille.reyes" };
  const mockProfileData = {
    id: 1,
    firstName: "Guillermo",
    lastName: "Reyes",
    phone: "600123456",
    avatarURL: "https://foto.com",
    roleId: 2,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Configuramos las respuestas por defecto
    (authService.getCurrentUser as any).mockReturnValue(mockUser);
    (userService.getByUsername as any).mockResolvedValue({
      data: mockProfileData,
    });
    (userService.update as any).mockResolvedValue({});
    (userService.changePassword as any).mockResolvedValue({});
  });

  it("debe cargar los datos del perfil al montarse", async () => {
    render(<ProfilePage />);

    // Verifica el loading inicial
    expect(screen.getByText("Cargando tu perfil...")).toBeInTheDocument();

    // Espera a que termine de cargar
    await waitFor(() => {
      expect(
        screen.queryByText("Cargando tu perfil..."),
      ).not.toBeInTheDocument();
    });

    expect(authService.getCurrentUser).toHaveBeenCalled();
    expect(userService.getByUsername).toHaveBeenCalledWith("guille.reyes");
  });

  describe("Flujo de Edición de Avatar", () => {
    it("debe abrir el modal, confirmar y llamar a la API de actualización", async () => {
      render(<ProfilePage />);
      await waitFor(() =>
        expect(screen.getByText("MOCK_EDITAR_AVATAR")).toBeInTheDocument(),
      );

      // Clic en la tarjeta para abrir modal
      fireEvent.click(screen.getByText("MOCK_EDITAR_AVATAR"));
      expect(screen.getByText("Cambiar Foto de Perfil")).toBeInTheDocument();

      // Modificamos el input
      const input = screen.getByLabelText("URL de la Imagen");
      fireEvent.change(input, { target: { value: "https://nueva-foto.com" } });

      // Enviamos el formulario (Abre diálogo de confirmación)
      fireEvent.click(screen.getByText("Guardar Imagen"));
      expect(screen.getByText("¿Guardar cambios?")).toBeInTheDocument();

      // Confirmamos la acción
      fireEvent.click(screen.getByText("Confirmar"));

      // Verificamos que se llamó al backend y sale el mensaje de éxito
      await waitFor(() => {
        expect(userService.update).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            avatarURL: "https://nueva-foto.com",
          }),
        );
        expect(screen.getByText("¡Perfil actualizado!")).toBeInTheDocument();
      });
    });
  });

  describe("Flujo de Edición de Info Personal", () => {
    it("debe abrir el modal, cambiar datos y guardar correctamente", async () => {
      render(<ProfilePage />);
      await waitFor(() =>
        expect(screen.getByText("MOCK_EDITAR_PERSONAL")).toBeInTheDocument(),
      );

      fireEvent.click(screen.getByText("MOCK_EDITAR_PERSONAL"));
      expect(
        screen.getByText("Editar Información Personal"),
      ).toBeInTheDocument();

      const inputNombre = screen.getByLabelText("Nombre");
      fireEvent.change(inputNombre, { target: { value: "Guille Modificado" } });

      fireEvent.click(screen.getByText("Guardar Cambios"));
      fireEvent.click(screen.getByText("Confirmar")); // En el ConfirmDialog

      await waitFor(() => {
        expect(userService.update).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            firstName: "Guille Modificado",
          }),
        );
      });
    });

    it("debe manejar errores de servidor usando window.alert", async () => {
      // Mockeamos un fallo en la API
      (userService.update as any).mockRejectedValueOnce({
        response: { data: { message: "Error interno del servidor" } },
      });
      const alertSpy = vi
        .spyOn(globalThis, "alert")
        .mockImplementation(() => {});

      render(<ProfilePage />);
      await waitFor(() =>
        expect(screen.getByText("MOCK_EDITAR_PERSONAL")).toBeInTheDocument(),
      );

      fireEvent.click(screen.getByText("MOCK_EDITAR_PERSONAL"));
      fireEvent.click(screen.getByText("Guardar Cambios"));
      fireEvent.click(screen.getByText("Confirmar"));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith("Error interno del servidor");
      });
      alertSpy.mockRestore();
    });
  });

  describe("Flujo de Cambio de Contraseña", () => {
    it("debe abrir diálogo de confirmación y procesar el cambio", async () => {
      render(<ProfilePage />);
      await waitFor(() =>
        expect(screen.getByText("MOCK_CAMBIAR_PASS")).toBeInTheDocument(),
      );

      // Dispara la acción de cambiar contraseña desde la tarjeta mockeada
      fireEvent.click(screen.getByText("MOCK_CAMBIAR_PASS"));

      expect(
        screen.getByText("¿Confirmar cambio de contraseña?"),
      ).toBeInTheDocument();
      fireEvent.click(screen.getByText("Confirmar"));

      await waitFor(() => {
        expect(userService.changePassword).toHaveBeenCalledWith({
          oldPass: "123",
          newPass: "321",
        });
        expect(
          screen.getByText("¡Contraseña actualizada!"),
        ).toBeInTheDocument();
      });
    });

    it("debe gestionar el error si la contraseña actual es incorrecta", async () => {
      (userService.changePassword as any).mockRejectedValueOnce({
        response: { data: { message: "La contraseña antigua no coincide" } },
      });

      render(<ProfilePage />);
      await waitFor(() =>
        expect(screen.getByText("MOCK_CAMBIAR_PASS")).toBeInTheDocument(),
      );

      fireEvent.click(screen.getByText("MOCK_CAMBIAR_PASS"));
      fireEvent.click(screen.getByText("Confirmar"));

      // El error se pasa al estado serverPasswordError, el modal de confirmación se cierra
      await waitFor(() => {
        expect(
          screen.queryByText("¿Confirmar cambio de contraseña?"),
        ).not.toBeInTheDocument();
      });
    });
  });
});
