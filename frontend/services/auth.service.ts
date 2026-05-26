import api from "@/lib/axios";

export const authService = {
  register: async (data) => {
    const response = await api.post("/api/auth/register", data);
    return response.data;
  },

  login: async (data) => {
    const response = await api.post("/api/auth/login", data);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post("/api/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (data: { token: string; password: string }) => {
    const response = await api.post("/api/auth/reset-password", data);
    return response.data;
  },
};
