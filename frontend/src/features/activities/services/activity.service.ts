import api from "../../../api/axios";

const ENDPOINT = "/activities";

export interface Activity {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  capacity: number;
  location: string;
  active: boolean;
  teamIds: number[];
  teamNames: string[];
  registeredCount: number;
  userRegistered: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export const activityService = {
  getAll: () => api.get<Activity[]>(ENDPOINT),
  getById: (id: number) => api.get<Activity>(`${ENDPOINT}/${id}`),
  getDeletedHistory: () => api.get<Activity[]>(`${ENDPOINT}/deleted`),
  create: (data: Partial<Activity>) => api.post<Activity>(ENDPOINT, data),
  update: (id: number, data: Partial<Activity>) =>
    api.put<Activity>(`${ENDPOINT}/${id}`, data),
  delete: (id: number) => api.delete(`${ENDPOINT}/${id}`),
};
