import axios from "axios";

const api = axios.create({
  baseURL: "/api", 
  headers: {
    "Content-Type": "application/json",
  },
});

// INTERCEPTOR DE PETICIÓN
// Añade el token JWT a cada cabecera antes de salir
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// INTERCEPTOR DE RESPUESTA
// Maneja errores globales, como la expiración del token o usuarios inexistentes
api.interceptors.response.use(
  (response) => response, // Si la respuesta es 2xx, pasa de largo
  (error) => {
    // Error de red (Servidor caído o sin respuesta)
    if (!error.response) {
      console.error("DEBUG - Axios: Error de red / Servidor no responde");
      return Promise.reject(error);
    }

    const { status } = error.response;

    // Error 401: Sesión expirada, token inválido o usuario no encontrado en DB
    if (status === 401) {
      console.warn("DEBUG - Axios: Error 401 detectado - Limpiando sesión");

      // Borramos el rastro del usuario antiguo para evitar bloqueos
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Solo redirigimos si no estamos ya en la página de login
      if (!globalThis.location.pathname.includes("/login")) {;
        
        // Redirección forzosa al login con parámetro para aviso visual
        globalThis.location.href = "/login?expired=true";
      }
    }

    // Error 403: Prohibido (Falta de permisos de rol)
    if (status === 403) {
      console.error("DEBUG - Axios: Error 403 - No tienes permisos suficientes");
    }

    // Error 500: Fallo del servidor
    if (status === 500) {
      console.error("DEBUG - Axios: Error 500 - Error interno del servidor");
    }

    return Promise.reject(error);
  }
);

export default api;