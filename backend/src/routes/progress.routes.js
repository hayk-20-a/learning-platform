const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");
const prisma = require("../utils/prisma");

// POST /api/progress — mark a lesson complete
router.post("/", authenticate, async (req, res, next) => {
  try {
    const { lessonId } = req.body;
    const userId = req.user.userId;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: { select: { id: true } },
          },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.section.course.id,
        },
      },
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    const progress = await prisma.progress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: {
        isCompleted: true,
        completedAt: new Date(),
      },
      create: {
        userId,
        lessonId,
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    res.json({ success: true, data: progress });
  } catch (err) {
    next(err);
  }
});

// GET /api/progress/:courseId — get progress for a course
router.get("/:courseId", authenticate, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { courseId } = req.params;

    // Get all lessons in this course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          include: {
            lessons: { select: { id: true } },
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    const lessonIds = course.sections.flatMap((s) =>
      s.lessons.map((l) => l.id),
    );

    // Get completed lessons
    const progress = await prisma.progress.findMany({
      where: {
        userId,
        lessonId: { in: lessonIds },
        isCompleted: true,
      },
    });

    const completedIds = progress.map((p) => p.lessonId);
    const percent =
      lessonIds.length > 0
        ? Math.round((completedIds.length / lessonIds.length) * 100)
        : 0;

    res.json({
      success: true,
      data: {
        completedLessonIds: completedIds,
        totalLessons: lessonIds.length,
        completedLessons: completedIds.length,
        percent,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
