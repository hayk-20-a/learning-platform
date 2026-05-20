const express = require("express");
const prisma = require("../utils/prisma");
const router = express.Router();
const courseController = require("../controllers/course.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

// GET /api/courses/id/:id — get course by ID (for teacher edit page)
router.get("/id/:id", authenticate, async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: { category: true },
    });
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }
    if (course.teacherId !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
});

// ── Public routes (no login required) ──────────────────────────
router.get("/", courseController.getAllCourses);
router.get("/:slug", courseController.getCourseBySlug);

// ── Protected routes (must be logged in + correct role) ────────
router.get(
  "/teacher/my-courses",
  authenticate,
  authorize("TEACHER", "ADMIN"),
  courseController.getMyCourses,
);

router.post(
  "/",
  authenticate,
  authorize("TEACHER", "ADMIN"),
  courseController.createCourse,
);

router.put(
  "/:id",
  authenticate,
  authorize("TEACHER", "ADMIN"),
  courseController.updateCourse,
);

router.delete(
  "/:id",
  authenticate,
  authorize("TEACHER", "ADMIN"),
  courseController.deleteCourse,
);

module.exports = router;
