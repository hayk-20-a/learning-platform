const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { uploadVideo, uploadImage } = require("../utils/cloudinary");
const prisma = require("../utils/prisma");
const { validateIdParam } = require("../validators/request.validators");

// POST /api/upload/video/:lessonId
// Teacher uploads a video to a specific lesson
router.post(
  "/video/:lessonId",
  authenticate,
  authorize("TEACHER", "ADMIN"),
  validateIdParam("lessonId"),
  uploadVideo.single("video"), // 'video' is the form field name
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No video file provided",
        });
      }

      // Verify the teacher owns this lesson
      const lesson = await prisma.lesson.findUnique({
        where: { id: req.params.lessonId },
        include: { section: { include: { course: true } } },
      });

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: "Lesson not found",
        });
      }

      if (lesson.section.course.teacherId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      // req.file.path is the Cloudinary URL
      // req.file.duration is available for videos
      const updated = await prisma.lesson.update({
        where: { id: req.params.lessonId },
        data: {
          videoUrl: req.file.path,
          durationSeconds: Math.round(req.file.duration || 0),
        },
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/upload/thumbnail/:courseId
// Teacher uploads a thumbnail to a course
router.post(
  "/thumbnail/:courseId",
  authenticate,
  authorize("TEACHER", "ADMIN"),
  validateIdParam("courseId"),
  uploadImage.single("thumbnail"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      const course = await prisma.course.findUnique({
        where: { id: req.params.courseId },
      });

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      if (course.teacherId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      const updated = await prisma.course.update({
        where: { id: req.params.courseId },
        data: { thumbnailUrl: req.file.path },
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
