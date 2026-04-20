import axios from "axios";
import { authService } from "../features/auth/services/auth.service";

const api = axios.create({
  baseURL: "http://localhost:8080/api", // URL de tu backend en SpringBoot
  headers: {
    "Content-Type": "application/json",
  },
});

//INTERCEPTOR DE PETICIÓN
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
  },
);

//INTERCEPTOR DE RESPUESTA
// Maneja errores globales, como la expiración del token
api.interceptors.response.use(
  (response) => response, // Si la respuesta es 2xx, pasa de largo
  (error) => {
    // Error de red (Servidor caído)
    if (!error.response) {
      console.error("DEBUG - Axios: Error de red / Servidor no responde");
      // Opcional: alert("No se pudo conectar con el servidor.");
      return Promise.reject(error);
    }

    const { status } = error.response;

    // Error 401: Sesión expirada o no autorizado
    if (status === 401) {
      console.warn("DEBUG - Axios: Error 401 detectado - Sesión caducada");

      // Solo actuamos si no estamos ya en la página de login (evita bucles)
      if (!globalThis.location.pathname.includes("/login")) {
        // Ejecutamos el logout del servicio (que limpia localStorage)
        authService.logout();

        // Avisamos al usuario para que no se asuste
        alert(
          "Tu sesión ha expirado por seguridad. Por favor, identifícate de nuevo.",
        );

        // Redirigimos por "fuerza bruta" al login
        // Usamos window.location porque los interceptores están fuera del contexto de React Router
        globalThis.location.href = "/login";
      }
    }

    // Error 403: Prohibido (El usuario no tiene permisos para esa acción específica)
    if (status === 403) {
      console.error("DEBUG - Axios: Error 403 - No tienes permisos para esto");
      // Aquí podrías mostrar un toast avisando de falta de permisos
    }

    return Promise.reject(error);
  },
);

export default api;
