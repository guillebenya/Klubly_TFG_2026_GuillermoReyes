import axios from 'axios';
import { authService } from '../features/auth/services/auth.service';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', //URL de mi backend en SpringBoot
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor de petición: Se ejecuta antes de que cada petición salga hacia el backend
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Si tenemos un token guardado, lo pegamos en la cabecera
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//Interceptor de respuesta: Se ejecuta cuando recibimos una respuesta del backend
api.interceptors.response.use(
  (response) => response, // Si todo va bien, devolvemos la respuesta
  (error) => {

    console.error("DEBUG - Axios Interceptor: Error detectado", error.response?.status);
    // Si el servidor responde 401 (Token caducado o inválido)
    if (error.response && error.response.status === 401) {
      console.error("DEBUG - Axios Interceptor: Error 401, ejecutando logout");
      //authService.logout(); // Limpiamos y mandamos al login
    }
    return Promise.reject(error);
  });

export default api;