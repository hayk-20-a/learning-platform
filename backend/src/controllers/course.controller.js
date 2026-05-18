const courseService = require("../services/course.service");

const getAllCourses = async (req, res, next) => {
  try {
    // req.query contains URL query params like ?category=programming&page=1
    const courses = await courseService.getAllCourses(req.query);
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};

const getCourseBySlug = async (req, res, next) => {
  try {
    const course = await courseService.getCourseBySlug(req.params.slug);
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

const getMyCourses = async (req, res, next) => {
  try {
    // req.user was attached by the authenticate middleware
    const courses = await courseService.getMyCourses(req.user.userId);
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const course = await courseService.createCourse({
      ...req.body,
      teacherId: req.user.userId, // always take teacherId from the token, never from body
    });
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const course = await courseService.updateCourse({
      courseId: req.params.id,
      teacherId: req.user.userId, // service will verify ownership
      data: req.body,
    });
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    await courseService.deleteCourse({
      courseId: req.params.id,
      teacherId: req.user.userId,
    });
    res
      .status(200)
      .json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCourses,
  getCourseBySlug,
  getMyCourses,
  createCourse,
  updateCourse,
  deleteCourse,
};
