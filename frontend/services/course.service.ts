import api from "@/lib/axios";

export const courseService = {
  getAll: async (params: Record<string, unknown> = {}) => {
    const response = await api.get("/api/courses", { params });
    return response.data;
  },

  getBySlug: async (slug: string) => {
    const response = await api.get(`/api/courses/${slug}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/courses/id/${id}`);
    return response.data;
  },

  getMyCourses: async () => {
    const response = await api.get("/api/courses/teacher/my-courses");
    return response.data;
  },

  create: async (data: Record<string, unknown>) => {
    const response = await api.post("/api/courses", data);
    return response.data;
  },

  update: async (id: string, data: Partial<Record<string, unknown>>) => {
    const response = await api.put(`/api/courses/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/courses/${id}`);
    return response.data;
  },
};
