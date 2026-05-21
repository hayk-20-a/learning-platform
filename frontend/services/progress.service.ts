import api from "@/lib/axios";

export const progressService = {
  markComplete: async (lessonId: string) => {
    const response = await api.post("/api/progress", { lessonId });
    return response.data;
  },

  getCourseProgress: async (courseId: string) => {
    const response = await api.get(`/api/progress/${courseId}`);
    return response.data;
  },
};
