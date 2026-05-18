const express = require("express");
const router = express.Router();
const courseController = require("../controllers/course.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

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
