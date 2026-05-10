import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import LoginPage from "./LoginPage";
import { authService } from "../services/auth.service";

// Mockeamos el servicio de autenticación
vi.mock("../services/auth.service", () => ({
  authService: {
    login: vi.fn(),
  },
}));

// Mockeamos useNavigate de react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe renderizar correctamente los campos de usuario y contraseña", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByPlaceholderText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("debe mostrar un error si el login falla", async () => {
    const user = userEvent.setup();
    // Simulamos que el servicio lanza un error
    vi.mocked(authService.login).mockRejectedValue(new Error("Unauthorized"));

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    // Escribimos credenciales
    await user.type(screen.getByPlaceholderText(/usuario/i), "wronguser");
    await user.type(screen.getByPlaceholderText(/••••••••/i), "wrongpass");

    // Click en entrar
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    // Verificamos que aparece el mensaje de error
    const errorMessage = await screen.findByText(/credenciales incorrectas/i);
    expect(errorMessage).toBeInTheDocument();
  });

  it("debe llamar al servicio de login y redirigir al dashboard si tiene éxito", async () => {
    const user = userEvent.setup();
    // Simulamos éxito en el servicio
    vi.mocked(authService.login).mockResolvedValue({ accessToken: "token123" });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    // Rellenamos el formulario
    await user.type(screen.getByPlaceholderText(/usuario/i), "admin");
    await user.type(screen.getByPlaceholderText(/••••••••/i), "password123");

    // Enviamos
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    // Verificamos llamada al servicio
    expect(authService.login).toHaveBeenCalledWith("admin", "password123");

    // Verificamos que se navegó al dashboard
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("debe redirigir a la página de registro al hacer clic en el enlace", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    const registerBtn = screen.getByRole("button", {
      name: /regístrate aquí/i,
    });
    await user.click(registerBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/register");
  });
});
