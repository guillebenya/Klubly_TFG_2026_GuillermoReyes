import api from '../../../api/axios';

const ENDPOINT = '/identity/affiliations';

export const affiliationService = {
  getAll: () => api.get(ENDPOINT),
  getById: (id: number) => api.get(`${ENDPOINT}/${id}`),
  // Estas son las que usaremos para las pantallas de Miembros y Perfil
  getByUserId: (userId: number) => api.get(`${ENDPOINT}/user/${userId}`),
  getByTeamId: (teamId: number) => api.get(`${ENDPOINT}/team/${teamId}`),
  
  create: (data: { userId: number; teamId: number; teamPosition: string }) => 
    api.post(ENDPOINT, data),
  update: (id: number, data: { teamPosition: string }) => 
    api.put(`${ENDPOINT}/${id}`, data),
  delete: (id: number) => api.delete(`${ENDPOINT}/${id}`),
};