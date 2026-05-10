import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import RegisterPage from './RegisterPage';
import { authService } from '../services/auth.service';

// 1. Mock de authService
vi.mock('../services/auth.service', () => ({
  authService: {
    register: vi.fn(),
  },
}));

// 2. Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock de MemberForm para controlar cuándo se envía
vi.mock('../../identity/components/MemberForm', () => ({
  default: ({ onSubmit, onCancel, loading }: any) => (
    <div data-testid="mock-member-form">
      <button onClick={() => onSubmit({ username: 'newuser' })}>Simular Registro</button>
      <button onClick={onCancel}>Simular Cancelar</button>
      {loading && <span>Cargando...</span>}
    </div>
  ),
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mostrar el formulario de registro inicialmente', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Únete al Club/i)).toBeInTheDocument();
    expect(screen.getByTestId('mock-member-form')).toBeInTheDocument();
  });

  it('debe mostrar el mensaje de éxito tras un registro correcto', async () => {
    vi.mocked(authService.register).mockResolvedValue({ message: 'Success' });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    // Simulamos el envío del formulario
    fireEvent.click(screen.getByText('Simular Registro'));

    // Verificamos que aparece el mensaje de éxito
    expect(await screen.findByText(/¡Solicitud Enviada!/i)).toBeInTheDocument();
    expect(screen.getByText(/un administrador debe activarla/i)).toBeInTheDocument();
  });

  it('debe navegar al login al pulsar el botón de volver tras el éxito', async () => {
    vi.mocked(authService.register).mockResolvedValue({ message: 'Success' });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    // Pasamos a la pantalla de éxito
    fireEvent.click(screen.getByText('Simular Registro'));
    
    // Pulsamos el botón de volver
    const backBtn = await screen.findByRole('button', { name: /volver al inicio de sesión/i });
    fireEvent.click(backBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('debe mostrar un mensaje de error si el servicio falla', async () => {
    const errorMsg = 'El email ya está registrado';
    vi.mocked(authService.register).mockRejectedValue({
      response: { data: { message: errorMsg } }
    });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Simular Registro'));

    expect(await screen.findByText(errorMsg)).toBeInTheDocument();
  });

  it('debe navegar al login si el usuario cancela el formulario', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Simular Cancelar'));

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});