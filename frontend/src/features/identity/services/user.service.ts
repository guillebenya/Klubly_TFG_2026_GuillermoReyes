import api from '../../../api/axios';

const ENDPOINT = '/users';

export const userService = {
  getAll: () => api.get(ENDPOINT),
  getById: (id: number) => api.get(`${ENDPOINT}/${id}`),
  create: (userData: any) => api.post(ENDPOINT, userData),
  update: (id: number, userData: any) => api.put(`${ENDPOINT}/${id}`, userData),
  delete: (id: number) => api.delete(`${ENDPOINT}/${id}`),
};