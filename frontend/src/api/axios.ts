import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', //URL de mi backend en SpringBoot
    headers: {
        'Content-Type': 'application/json',
    },
});

// INTERCEPTOR: Se ejecuta antes de que cada petición salga hacia el backend
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

export default api;