import api from "../../../api/axios";

const ENDPOINT = "/registrations";

export interface Registration {
  id: number;
  userId: number;
  activityId: number;
  registrationDate: string;
  active: boolean;
  userFullName: string;
  userEmail: string;
  userPhone: string;
  teamName?: string;
  teamPosition?: string;
  createdAt?: string;
  deletedAt?: string | null;
}

export const registrationService = {
  //Para que el Admin/Staff gestione
  getByActivity: (activityId: number) => 
    api.get<Registration[]>(`${ENDPOINT}/activity/${activityId}`),
  
  addManual: (activityId: number, userId: number) => 
    api.post<Registration>(`${ENDPOINT}/activity/${activityId}/user/${userId}`),
  
  remove: (id: number) => api.delete(`${ENDPOINT}/${id}`),

  //Para que el Member se apunte/desapunte
  registerSelf: (activityId: number) => 
    api.post<Registration>(`${ENDPOINT}/activity/${activityId}/self`),
    
  unregisterSelf: (activityId: number) => 
    api.delete(`${ENDPOINT}/activity/${activityId}/self`),
};