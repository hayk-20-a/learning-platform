import api from "@/lib/axios";

export const courseService = {
  getAll: async (params = {}) => {
    const response = await api.get("/api/courses", { params });
    return response.data;
  },

  getBySlug: async (slug) => {
    const response = await api.get(`/api/courses/${slug}`);
    return response.data;
  },

  getMyCourses: async () => {
    const response = await api.get("/api/courses/teacher/my-courses");
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/api/courses", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/courses/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/courses/${id}`);
    return response.data;
  },
};
