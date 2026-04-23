import api from "../../../api/axios";

const ENDPOINT = "/identity/users";

export const userService = {
  getAll: () => api.get(ENDPOINT),
  getById: (id: number) => api.get(`${ENDPOINT}/${id}`),
  getByUsername: (username: string) =>
    api.get<any>(`${ENDPOINT}/username/${username}`),
  create: (userData: any) => api.post(ENDPOINT, userData),
  update: (id: number, userData: any) => api.put(`${ENDPOINT}/${id}`, userData),
  delete: (id: number) => api.delete(`${ENDPOINT}/${id}`),
  changePassword: (data: any) => api.post(`${ENDPOINT}/change-password`, data),
};
