import api from '../../../api/axios';

const ENDPOINT = '/identity/teams';

export interface Team {
  id: number;
  name: string;
  description: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export const teamService = {
  getAll: () => api.get(ENDPOINT),
  getById: (id: number) => api.get(`${ENDPOINT}/${id}`),
  create: (teamData: any) => api.post(ENDPOINT, teamData),
  update: (id: number, teamData: any) => api.put(`${ENDPOINT}/${id}`, teamData),
  delete: (id: number) => api.delete(`${ENDPOINT}/${id}`),
};