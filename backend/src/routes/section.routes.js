const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const prisma = require("../utils/prisma");
const {
  validateIdParam,
  validateLessonBody,
  validateSectionBody,
} = require("../validators/request.validators");

// POST /api/courses/:courseId/sections
router.post(
  "/courses/:courseId/sections",
  authenticate,
  authorize("TEACHER", "ADMIN"),
  validateIdParam("courseId"),
  validateSectionBody,
  async (req, res, next) => {
    try {
      const { title } = req.body;
      const { courseId } = req.params;

      // Verify ownership
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });
      if (!course) {
        return res
          .status(404)
          .json({ success: false, message: "Course not found" });
      }
      if (course.teacherId !== req.user.userId) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      // Get the highest orderIndex so far and add 1
      const lastSection = await prisma.section.findFirst({
        where: { courseId },
        orderBy: { orderIndex: "desc" },
      });
      const orderIndex = lastSection ? lastSection.orderIndex + 1 : 0;

      const section = await prisma.section.create({
        data: { title, courseId, orderIndex },
        include: { lessons: true },
      });

      res.status(201).json({ success: true, data: section });
    } catch (err) {
      next(err);
    }
  },
);

// PUT /api/sections/:id
router.put(
  "/sections/:id",
  authenticate,
  authorize("TEACHER", "ADMIN"),
  validateIdParam("id"),
  validateSectionBody,
  async (req, res, next) => {
    try {
      const { title } = req.body;

      const section = await prisma.section.findUnique({
        where: { id: req.params.id },
        include: { course: true },
      });
      if (!section) {
        return res
          .status(404)
          .json({ success: false, message: "Section not found" });
      }
      if (section.course.teacherId !== req.user.userId) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      const updated = await prisma.section.update({
        where: { id: req.params.id },
        data: { title },
        include: { lessons: true },
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /api/sections/:id
router.delete(
  "/sections/:id",
  authenticate,
  authorize("TEACHER", "ADMIN"),
  validateIdParam("id"),
  async (req, res, next) => {
    try {
      const section = await prisma.section.findUnique({
        where: { id: req.params.id },
        include: { course: true },
      });
      if (!section) {
        return res
          .status(404)
          .json({ success: false, message: "Section not found" });
      }
      if (section.course.teacherId !== req.user.userId) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      await prisma.section.delete({ where: { id: req.params.id } });
      res.json({ success: true, message: "Section deleted" });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/sections/:sectionId/lessons
router.post(
  "/sections/:sectionId/lessons",
  authenticate,
  authorize("TEACHER", "ADMIN"),
  validateIdParam("sectionId"),
  validateLessonBody,
  async (req, res, next) => {
    try {
      const { title, isFreePreview } = req.body;
      const { sectionId } = req.params;

      const section = await prisma.section.findUnique({
        where: { id: sectionId },
        include: { course: true },
      });
      if (!section) {
        return res
          .status(404)
          .json({ success: false, message: "Section not found" });
      }
      if (section.course.teacherId !== req.user.userId) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      const lastLesson = await prisma.lesson.findFirst({
        where: { sectionId },
        orderBy: { orderIndex: "desc" },
      });
      const orderIndex = lastLesson ? lastLesson.orderIndex + 1 : 0;

      const lesson = await prisma.lesson.create({
        data: {
          title,
          sectionId,
          orderIndex,
          isFreePreview: isFreePreview || false,
        },
      });

      res.status(201).json({ success: true, data: lesson });
    } catch (err) {
      next(err);
    }
  },
);

// PUT /api/lessons/:id
router.put(
  "/lessons/:id",
  authenticate,
  authorize("TEACHER", "ADMIN"),
  validateIdParam("id"),
  validateLessonBody,
  async (req, res, next) => {
    try {
      const { title, isFreePreview } = req.body;

      const lesson = await prisma.lesson.findUnique({
        where: { id: req.params.id },
        include: { section: { include: { course: true } } },
      });
      if (!lesson) {
        return res
          .status(404)
          .json({ success: false, message: "Lesson not found" });
      }
      if (lesson.section.course.teacherId !== req.user.userId) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      const updated = await prisma.lesson.update({
        where: { id: req.params.id },
        data: { title, isFreePreview },
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /api/lessons/:id
router.delete(
  "/lessons/:id",
  authenticate,
  authorize("TEACHER", "ADMIN"),
  validateIdParam("id"),
  async (req, res, next) => {
    try {
      const lesson = await prisma.lesson.findUnique({
        where: { id: req.params.id },
        include: { section: { include: { course: true } } },
      });
      if (!lesson) {
        return res
          .status(404)
          .json({ success: false, message: "Lesson not found" });
      }
      if (lesson.section.course.teacherId !== req.user.userId) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      await prisma.lesson.delete({ where: { id: req.params.id } });
      res.json({ success: true, message: "Lesson deleted" });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
