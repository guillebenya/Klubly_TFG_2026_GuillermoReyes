import api from "../../../api/axios";

const ENDPOINT = "/inventory/items";

export interface Item {
  id: number;
  name: string;
  description: string;
  stockQuantity: number;
  minStock: number;
  location: string;
  categoryId: number;
  categoryName: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export const itemService = {
  getAll: () => api.get<Item[]>(ENDPOINT),
  getDeletedHistory: () => api.get<Item[]>(`${ENDPOINT}/history/deleted`),
  getById: (id: number) => api.get<Item>(`${ENDPOINT}/${id}`),
  create: (data: Partial<Item>) => api.post<Item>(ENDPOINT, data),
  update: (id: number, data: Partial<Item>) =>
    api.put<Item>(`${ENDPOINT}/${id}`, data),
  delete: (id: number) => api.delete(`${ENDPOINT}/${id}`),
};