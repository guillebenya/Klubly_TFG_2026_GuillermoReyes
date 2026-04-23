import api from "../../../api/axios";

const ENDPOINT = "/identity/teams";

export interface Team {
  id: number;
  name: string;
  description: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  memberCount?: number; // Informativo
}

export const teamService = {
  getAll: () => api.get<Team[]>(ENDPOINT),
  getById: (id: number) => api.get<Team>(`${ENDPOINT}/${id}`),
  create: (data: Partial<Team>) => api.post<Team>(ENDPOINT, data),
  update: (id: number, data: Partial<Team>) =>
    api.put<Team>(`${ENDPOINT}/${id}`, data),
  delete: (id: number) => api.delete(`${ENDPOINT}/${id}`),
};
