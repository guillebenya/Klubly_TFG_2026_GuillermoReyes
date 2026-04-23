import api from '../../../api/axios';

const ENDPOINT = '/identity/roles';

export interface Role {
  id: number;
  name: string;
  description: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export const roleService = {
  /*Obtiene todos los roles disponibles */
  getAll: () => api.get<Role[]>(ENDPOINT),

  /* Obtiene un rol por su ID */
  getById: (id: number) => api.get<Role>(`${ENDPOINT}/${id}`),

  /* Crea un nuevo rol */
  create: (roleData: Omit<Role, 'id'>) => api.post<Role>(ENDPOINT, roleData),

  /* Actualiza un rol existente */
  update: (id: number, roleData: Partial<Role>) => api.put<Role>(`${ENDPOINT}/${id}`, roleData),

  /* Elimina un rol (Soft Delete) */
  delete: (id: number) => api.delete(`${ENDPOINT}/${id}`),
};