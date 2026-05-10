import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MemberForm from "./MemberForm";
import {
  type Role,
  roleService,
} from "../../configuration/services/role.service";
import { authService } from "../../auth/services/auth.service";

// 1. Mocks de servicios
vi.mock("../../configuration/services/role.service", () => ({
  roleService: {
    getAll: vi.fn(),
  },
}));

vi.mock("../../auth/services/auth.service", () => ({
  authService: {
    getCurrentUser: vi.fn(),
  },
}));

describe("MemberForm", () => {
  const mockRoles: Role[] = [
    {
      id: 1,
      name: "admin",
      description: "Administrador total",
      active: true,
      userCount: 1,
    },
    {
      id: 2,
      name: "moderator",
      description: "Moderador de contenido",
      active: true,
      userCount: 0,
    },
    {
      id: 3,
      name: "user",
      description: "Socio estándar",
      active: true,
      userCount: 10,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Respuesta por defecto para roles
    vi.mocked(roleService.getAll).mockResolvedValue({
      data: mockRoles,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as any,
    });
    // Por defecto, no es el mismo usuario
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      id: 999,
      username: "admin",
    });
  });

  it('debe mostrar error si las contraseñas no coinciden', async () => {
  const user = userEvent.setup();
  render(<MemberForm onSubmit={vi.fn()} onCancel={vi.fn()} isRegistration={true} />);

  // Rellenamos todos los campos obligatorios
  // Si falta uno, el formulario no se "envía" y el test falla.
  await user.type(screen.getByPlaceholderText(/perez.juan/i), 'testuser');
  await user.type(screen.getByPlaceholderText(/ejemplo@klubly.com/i), 'test@test.com');
  await user.type(screen.getByLabelText(/Nombre/i), 'Juan');
  await user.type(screen.getByLabelText(/Apellidos/i), 'Pérez');
  
  // Ponemos las contraseñas que NO coinciden
  const passwordInputs = screen.getAllByPlaceholderText(/Mínimo 6 caracteres|Repite la contraseña/i);
  await user.type(passwordInputs[0], 'password123');
  await user.type(passwordInputs[1], 'password456');

  // Hacemos click en el botón de envío
  const submitBtn = screen.getByRole('button', { name: /Crear cuenta/i });
  await user.click(submitBtn);

  // Verificamos el error con findByText
  const errorMessage = await screen.findByText((content) => content.includes('Las contraseñas no coinciden'));
  expect(errorMessage).toBeInTheDocument();
});

  it("debe bloquear campos sensibles si el usuario se edita a sí mismo", async () => {
    const selfUser = { id: 1, username: "guillermo" };
    vi.mocked(authService.getCurrentUser).mockReturnValue(selfUser);

    render(
      <MemberForm
        initialData={{ ...selfUser, roleId: 1, active: true }}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    // Debe mostrar la alerta de seguridad
    expect(
      screen.getByText(/Estás editando tu propio perfil/i),
    ).toBeInTheDocument();

    // El select de rol debe estar deshabilitado
    await waitFor(() => {
      const roleSelect = screen.getByRole("combobox");
      expect(roleSelect).toBeDisabled();
    });

    // El toggle de "Usuario Activo" debe tener la clase de no permitido o estar bloqueado
    expect(
      screen.getByText(/No puedes desactivar tu propia cuenta/i),
    ).toBeInTheDocument();
  });

  it("no debe cargar roles si está en modo registro público", () => {
    render(
      <MemberForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isRegistration={true}
      />,
    );

    expect(roleService.getAll).not.toHaveBeenCalled();
    expect(screen.queryByText(/Rol/i)).not.toBeInTheDocument();
  });

  it("debe llamar a onSubmit con los datos correctos en creación", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(
      <MemberForm
        onSubmit={handleSubmit}
        onCancel={vi.fn()}
        isRegistration={false}
      />,
    );

    // Esperamos a que carguen los roles para que el form esté listo
    await waitFor(() => expect(roleService.getAll).toHaveBeenCalled());

    await user.type(screen.getByPlaceholderText(/perez.juan/i), "newmember");
    await user.type(
      screen.getByPlaceholderText(/ejemplo@klubly.com/i),
      "new@member.com",
    );
    await user.type(screen.getByLabelText(/Nombre/i), "Juan");
    await user.type(screen.getByLabelText(/Apellidos/i), "Pérez");

    const passwordInputs = screen.getAllByPlaceholderText(
      /Mínimo 6 caracteres|Repite la contraseña/i,
    );
    await user.type(passwordInputs[0], "123456");
    await user.type(passwordInputs[1], "123456");

    await user.click(screen.getByRole("button", { name: /Crear Miembro/i }));

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "newmember",
        email: "new@member.com",
        firstName: "Juan",
        lastName: "Pérez",
      }),
    );
  });

  it("debe mostrar aviso de usuario pendiente si initialData tiene isPending", () => {
    render(
      <MemberForm
        initialData={{ id: 5, username: "aspirante", isPending: true }}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/Este usuario ha solicitado unirse al club/i),
    ).toBeInTheDocument();
  });
});
