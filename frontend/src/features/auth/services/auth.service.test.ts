import { authService } from './auth.service';
import api from '../../../api/axios';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// 1. Mockeamos la instancia de axios que importas
vi.mock('../../../api/axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    
    // Mockeamos el redireccionamiento de location para que no rompa el test
    // Usamos una propiedad de lectura/escritura para simular el comportamiento
    const originalLocation = globalThis.location;
    vi.stubGlobal('location', { ...originalLocation, href: '' });
  });

  describe('login', () => {
    it('debe guardar el token y el usuario en localStorage tras un login exitoso', async () => {
      // GIVEN: Una respuesta exitosa de la API
      const mockResponse = {
        data: {
          accessToken: 'fake-jwt-token',
          id: 1,
          username: 'guillermo',
          firstName: 'Guille',
          lastName: 'Reyes',
          roleName: 'ADMIN',
          avatarURL: null,
          teamIds: [1, 2]
        }
      };
      
      // Forzamos a que el mock de axios devuelva esta respuesta
      vi.mocked(api.post).mockResolvedValue(mockResponse);

      // WHEN: Llamamos al login
      const result = await authService.login('guillermo', 'password123');

      // THEN: Comprobamos que se llamó a la API correctamente
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        username: 'guillermo',
        password: 'password123'
      });

      // Comprobamos los efectos secundarios en localStorage
      expect(localStorage.getItem('token')).toBe('fake-jwt-token');
      
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      expect(savedUser.username).toBe('guillermo');
      expect(savedUser.roleName).toBe('ADMIN');
      
      // Comprobamos que el servicio devuelve los datos
      expect(result).toEqual(mockResponse.data);
    });

    it('no debe guardar nada en localStorage si no hay accessToken en la respuesta', async () => {
      const mockResponse = { data: { message: 'Error' } };
      vi.mocked(api.post).mockResolvedValue(mockResponse);

      await authService.login('user', 'pass');

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('debe devolver el objeto usuario parseado desde localStorage', () => {
      const user = { username: 'test_user', id: 99 };
      localStorage.setItem('user', JSON.stringify(user));

      const result = authService.getCurrentUser();

      expect(result).toEqual(user);
    });

    it('debe devolver null si no hay usuario en localStorage', () => {
      const result = authService.getCurrentUser();
      expect(result).toBeNull();
    });
  });

  describe('logout', () => {
    it('debe limpiar el localStorage y redirigir al login', () => {
      // GIVEN: Sesión activa
      localStorage.setItem('token', 'token-to-delete');
      localStorage.setItem('user', 'user-to-delete');

      // WHEN
      authService.logout();

      // THEN
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(globalThis.location.href).toBe('/login');
    });
  });
});