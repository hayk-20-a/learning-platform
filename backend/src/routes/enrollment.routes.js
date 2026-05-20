const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");
const prisma = require("../utils/prisma");

// GET /api/enrollments/my — get my enrolled courses
router.get("/my", authenticate, async (req, res, next) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user.userId },
      include: {
        course: {
          include: {
            teacher: { select: { id: true, name: true } },
            category: true,
            _count: { select: { sections: true } },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });
    res.json({ success: true, data: enrollments });
  } catch (err) {
    next(err);
  }
});

// POST /api/enrollments — enroll in a course
router.post("/", authenticate, async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.userId;

    // Check course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }
    if (!course.isPublished) {
      return res
        .status(400)
        .json({ success: false, message: "Course is not available" });
    }

    // Check not already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Already enrolled" });
    }

    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId, isPaid: Number(course.price) === 0 },
    });

    res.status(201).json({ success: true, data: enrollment });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
