import api from "@/lib/axios";

export const enrollmentService = {
  enroll: async (courseId: string) => {
    const response = await api.post("/api/enrollments", { courseId });
    return response.data;
  },

  getMyEnrollments: async () => {
    const response = await api.get("/api/enrollments/my");
    return response.data;
  },
};
