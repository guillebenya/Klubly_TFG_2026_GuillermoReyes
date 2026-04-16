import api from "../../../api/axios.ts";

export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post("/auth/login", { username, password });

    // Si el login es correcto, guardamos el token en el navegador
    if (response.data.accessToken) {
      localStorage.setItem("token", response.data.accessToken);
    }

    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
  },
};
