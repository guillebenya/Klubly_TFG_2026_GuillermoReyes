import api from "../../../api/axios";

const ENDPOINT = "/identity/users";

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  clubPosition: string;
  avatarURL: string;
  active: boolean;
  isPending: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export const userService = {
  getAll: () => api.get(ENDPOINT),
  getDeletedHistory: () => api.get(`${ENDPOINT}/history/deleted`),
  getById: (id: number) => api.get(`${ENDPOINT}/${id}`),
  getByUsername: (username: string) =>
    api.get<any>(`${ENDPOINT}/username/${username}`),
  getByTeam: (teamId: number) => api.get<User[]>(`${ENDPOINT}/team/${teamId}`),
  create: (userData: any) => api.post(ENDPOINT, userData),
  update: (id: number, userData: any) => api.put(`${ENDPOINT}/${id}`, userData),
  delete: (id: number) => api.delete(`${ENDPOINT}/${id}`),
  changePassword: (data: any) => api.post(`${ENDPOINT}/change-password`, data),
};
