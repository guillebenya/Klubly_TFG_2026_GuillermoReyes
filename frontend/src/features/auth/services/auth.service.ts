import api from "../../../api/axios.ts";
import { jwtDecode } from "jwt-decode"; // Si la instalas

export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post("/auth/login", { username, password });

    if (response.data.accessToken) {
      localStorage.setItem("token", response.data.accessToken);
      // Opcional: Guardar los datos del usuario decodificados
      const decoded: any = jwtDecode(response.data.accessToken);
      localStorage.setItem("user", JSON.stringify({
        username: decoded.sub,
        role: decoded.role 
      }));
    }
    return response.data;
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },
};