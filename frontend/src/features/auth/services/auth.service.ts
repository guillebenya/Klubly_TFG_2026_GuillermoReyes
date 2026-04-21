import api from "../../../api/axios.ts";

export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post("/auth/login", { username, password });

    // Ahora recibimos: accessToken, tokenType, username, firstName, lastName, roleName
    if (response.data.accessToken) {
      localStorage.setItem("token", response.data.accessToken);

      // Guardamos los datos directamente.
      localStorage.setItem(
        "user",
        JSON.stringify({
          username: response.data.username,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          roleName: response.data.roleName,
          avatarURL: response.data.avatarURL,
          teamIds: response.data.teamIds,
        }),
      );
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
    globalThis.location.href = "/login";
  },
};
