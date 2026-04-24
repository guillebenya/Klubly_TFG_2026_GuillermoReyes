import api from "../../../api/axios";

const ENDPOINT = "/inventory/categories";

export interface Category {
  id: number;
  name: string;
  description: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  itemCount: number;
}

export const categoryService = {
  getAll: () => api.get<Category[]>(ENDPOINT),
  getDeletedHistory: () => api.get<Category[]>(`${ENDPOINT}/history/deleted`),
  getById: (id: number) => api.get<Category>(`${ENDPOINT}/${id}`),
  create: (data: Partial<Category>) => api.post<Category>(ENDPOINT, data),
  update: (id: number, data: Partial<Category>) =>
    api.put<Category>(`${ENDPOINT}/${id}`, data),
  delete: (id: number) => api.delete(`${ENDPOINT}/${id}`),
};