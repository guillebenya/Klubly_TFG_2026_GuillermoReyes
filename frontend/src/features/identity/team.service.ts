import api from '../../api/axios';

const ENDPOINT = '/teams';

export const teamService = {
  getAll: () => api.get(ENDPOINT),
  getById: (id: number) => api.get(`${ENDPOINT}/${id}`),
  create: (teamData: any) => api.post(ENDPOINT, teamData),
  update: (id: number, teamData: any) => api.put(`${ENDPOINT}/${id}`, teamData),
  delete: (id: number) => api.delete(`${ENDPOINT}/${id}`),
};