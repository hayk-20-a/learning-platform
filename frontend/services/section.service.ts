import api from "@/lib/axios";

export const sectionService = {
  create: async (courseId: string, data: { title: string }) => {
    const response = await api.post(`/api/courses/${courseId}/sections`, data);
    return response.data;
  },

  update: async (id: string, data: { title: string }) => {
    const response = await api.put(`/api/sections/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/sections/${id}`);
    return response.data;
  },
};

export const lessonService = {
  create: async (
    sectionId: string,
    data: { title: string; isFreePreview: boolean },
  ) => {
    const response = await api.post(`/api/sections/${sectionId}/lessons`, data);
    return response.data;
  },

  update: async (
    id: string,
    data: { title: string; isFreePreview: boolean },
  ) => {
    const response = await api.put(`/api/lessons/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/lessons/${id}`);
    return response.data;
  },
};
