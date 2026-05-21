import api from "@/lib/axios";

export const uploadService = {
  uploadVideo: async (
    lessonId: string,
    file: File,
    onProgress?: (percent: number) => void,
  ) => {
    const formData = new FormData();
    formData.append("video", file);

    const response = await api.post(`/api/upload/video/${lessonId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percent);
        }
      },
    });
    return response.data;
  },

  uploadThumbnail: async (courseId: string, file: File) => {
    const formData = new FormData();
    formData.append("thumbnail", file);

    const response = await api.post(
      `/api/upload/thumbnail/${courseId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },
};
